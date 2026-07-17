// src/services/emailActionServices.ts
import { prisma } from '../config/db';
import { getGmailClient } from '../integrations/gmailClient';
import { logger } from '../config/logger';

export async function editDraft(userId: string, emailId: string, editedReply: string) {
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) throw new Error('Email not found');
  if (email.userId !== userId) throw new Error('Unauthorized');

  return prisma.email.update({
    where: { id: emailId },
    data: { editedReply },
  });
}

export async function rejectDraft(userId: string, emailId: string) {
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) throw new Error('Email not found');
  if (email.userId !== userId) throw new Error('Unauthorized');

  return prisma.email.update({
    where: { id: emailId },
    data: { status: 'rejected' },
  });
}

export async function approveAndSend(userId: string, emailId: string) {
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) throw new Error('Email not found');
  if (email.userId !== userId) throw new Error('Unauthorized: email does not belong to this user');

  const replyText = email.editedReply || email.suggestedReply;
  if (!replyText) throw new Error('No draft reply available to send');

  const gmail = await getGmailClient(userId);

  const original = await gmail.users.messages.get({
    userId: 'me',
    id: email.gmailId,
    format: 'metadata',
    metadataHeaders: ['Message-ID'],
  });

  const originalMessageId = original.data.payload?.headers?.find(
    (h) => h.name === 'Message-ID'
  )?.value ?? undefined;

  const toAddress = extractEmailAddress(email.sender);

  const rawMessage = buildRawReply({
    to: toAddress,
    subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
    body: replyText,
    originalMessageId,
  });

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: rawMessage,
      threadId: email.threadId,
    },
  });

  const updated = await prisma.email.update({
    where: { id: emailId },
    data: { status: 'sent', sentAt: new Date() },
  });

  logger.info(`Sent approved reply for email ${emailId}`);
  return updated;
}

function extractEmailAddress(fromField: string): string {
  const match = fromField.match(/<(.+)>/);
  return match ? match[1] : fromField;
}

function buildRawReply({ to, subject, body, originalMessageId }: {
  to: string;
  subject: string;
  body: string;
  originalMessageId?: string;
}): string {
  const messageParts = [
    `To: ${to}`,
    `Subject: ${subject}`,
    ...(originalMessageId
      ? [`In-Reply-To: ${originalMessageId}`, `References: ${originalMessageId}`]
      : []),
    'Content-Type: text/plain; charset=utf-8',
    '',
    body,
  ];
  const message = messageParts.join('\n');

  return Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}