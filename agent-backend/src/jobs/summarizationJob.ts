// src/jobs/summarizationJob.ts
import { prisma } from '../config/db';
import { summarizeEmail } from '../services/summarizationService';
import { logger } from '../config/logger';

export async function summarizeUnprocessedEmails() {
  const emails = await prisma.email.findMany({
    where: { status: 'unread', summary: null },
    take: 10, // process in batches to avoid rate limits
  });

  for (const email of emails) {
    try {
      const result = await summarizeEmail({
        sender: email.sender,
        subject: email.subject,
        bodyRaw: email.bodyRaw,
      });

      await prisma.email.update({
        where: { id: email.id },
        data: {
          summary: result.summary,
          priority: result.priority,
          actionItems: result.actionItems,
          suggestedReply: result.suggestedReplyDraft,
          status: 'summarized',
        },
      });

      logger.info(`Summarized email ${email.id}`);
    } catch (err) {
      logger.error(`Failed to summarize email ${email.id}`, { error: err });
    }
  }
}