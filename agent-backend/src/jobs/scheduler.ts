// src/jobs/scheduler.ts
import cron from 'node-cron';
import { ingestEmailsForAllUsers } from './emailIngestionJob';
import { logger } from '../config/logger';

export function startScheduledJobs() {
  // Every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled email ingestion...');
    await ingestEmailsForAllUsers();
  });
}