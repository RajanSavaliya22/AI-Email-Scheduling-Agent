// src/services/notificationService.ts
import { prisma } from '../config/db';
import { getGmailClient } from '../integrations/gmailClient';
import { logger } from '../config/logger';

function encodeMimeSubject(subject: string): string {
  const encoded = Buffer.from(subject, 'utf-8').toString('base64');
  return `=?UTF-8?B?${encoded}?=`;
}

function buildNotificationEmail(to: string, subject: string, body: string): string {
  const messageParts = [
    `To: ${to}`,
    `Subject: ${encodeMimeSubject(subject)}`,
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ];
  return Buffer.from(messageParts.join('\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
export async function sendUrgentNotifications() {
  const urgentEmails = await prisma.email.findMany({
    where: {
      priority: 'urgent',
      notifiedAt: null,
      status: { in: ['draft_pending', 'summarized'] },
    },
  });

  for (const email of urgentEmails) {
    try {
      const user = await prisma.user.findUnique({ where: { id: email.userId } });
      if (!user) continue;

      const gmail = await getGmailClient(email.userId);

      const notifBody = `⚠️ Urgent email needs your attention:

From: ${email.sender}
Subject: ${email.subject}
Summary: ${email.summary}

Review and respond: [link to your dashboard]`;

      const raw = buildNotificationEmail(
        user.email,
        `⚠️ Urgent: ${email.subject}`,
        notifBody
      );

      await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
      });

      await prisma.email.update({
        where: { id: email.id },
        data: { notifiedAt: new Date() },
      });

      logger.info(`Sent urgent notification for email ${email.id}`);
    } catch (err) {
      logger.error(`Failed to notify for email ${email.id}`, { error: err });
    }
  }
}
export async function sendDailyDigest() {
  const users = await prisma.user.findMany();

  for (const user of users) {
    try {
      const pending = await prisma.email.findMany({
        where: {
          userId: user.id,
          status: { in: ['draft_pending', 'summarized'] },
        },
        orderBy: { priority: 'asc' }, // crude; see note below
      });

      if (pending.length === 0) continue;

      const lines = pending.map(
        (e) => `- [${e.priority?.toUpperCase()}] ${e.subject} (from ${e.sender})`
      );
      const priorityRank: Record<string, number> = { urgent: 0, normal: 1, low: 2 };
      const sorted = pending.sort(
        (a, b) => (priorityRank[a.priority ?? 'normal'] ?? 1) - (priorityRank[b.priority ?? 'normal'] ?? 1)
      );

      const digestBody = `Your daily inbox digest:\n\n${lines.join('\n')}\n\nReview all: [link to your dashboard]`;

      const gmail = await getGmailClient(user.id);
      const NOTIFICATION_TAG = '[AgentNotification]';

      const raw = buildNotificationEmail(
        user.email, 
        `${NOTIFICATION_TAG} 📋 Daily Digest — ${pending.length} items need attention`,
        digestBody
      );
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });

      logger.info(`Sent daily digest to user ${user.id} (${pending.length} items)`);
    } catch (err) {
      logger.error(`Failed to send digest to user ${user.id}`, { error: err });
    }
  }
}