// src/jobs/emailIngestionJob.ts
import { prisma } from '../config/db';
import { fetchRecentMessages } from '../integrations/gmailClient';
import { parseGmailMessage } from '../services/emailParser';
import { saveParsedEmail } from '../services/emailService';
import { logger } from '../config/logger';

export async function ingestEmailsForAllUsers() {
  const users = await prisma.user.findMany({ where: { tokens: { isNot: null } } });

  for (const user of users) {
    try {
      const messages = await fetchRecentMessages(user.id, 20);
      let newCount = 0;

      for (const msg of messages) {
        const parsed = parseGmailMessage(msg);
        const saved = await saveParsedEmail(user.id, parsed);
        if (saved) newCount++;
      }

      logger.info(`Ingested ${newCount} new emails for user ${user.id}`);
    } catch (err) {
      logger.error(`Failed to ingest emails for user ${user.id}`, { error: err });
    }
  }
}