// src/jobs/scheduler.ts
import cron from 'node-cron';
import { ingestEmailsForAllUsers } from './emailIngestionJob';
import { summarizeUnprocessedEmails } from './summarizationJob';
import { sendUrgentNotifications, sendDailyDigest } from '../services/notificationServices';
import { logger } from '../config/logger';

export function startScheduledJobs() {
  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled email ingestion...');
    await ingestEmailsForAllUsers();
  });

  cron.schedule('*/5 * * * *', async () => {
    logger.info('Running scheduled summarization...');
    await summarizeUnprocessedEmails();
  });

  // Check for urgent items every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    logger.info('Checking for urgent notifications...');
    await sendUrgentNotifications();
  });

  // Daily digest at 8 AM server time — adjust cron expression for user's timezone later
  cron.schedule('0 8 * * *', async () => {
    logger.info('Sending daily digest...');
    await sendDailyDigest();
  });
}