// src/jobs/scheduler.ts
import cron from 'node-cron';
import { ingestEmailsForAllUsers } from './emailIngestionJob';
import { summarizeUnprocessedEmails } from './summarizationJob';
import { logger } from '../config/logger';

export function startScheduledJobs() {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled email ingestion...');
    await ingestEmailsForAllUsers();
  });

  // Run shortly after ingestion, every 5 minutes offset
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled summarization...');
    await summarizeUnprocessedEmails();
  });
}