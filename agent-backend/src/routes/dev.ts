// src/routes/dev.ts
import express from 'express';
import { summarizeUnprocessedEmails } from '../jobs/summarizationJob';
import { ingestEmailsForAllUsers } from '../jobs/emailIngestionJob';
import { proposeAvailableSlots } from '../services/schedulingService';
import { sendUrgentNotifications, sendDailyDigest } from '../services/notificationServices';


const router = express.Router();

router.get('/trigger-ingestion', async (req, res) => {
  await ingestEmailsForAllUsers();
  res.json({ status: 'triggered' });
});
router.get('/trigger-summarization', async (req, res) => {
  await summarizeUnprocessedEmails();
  res.json({ status: 'triggered' });
});


router.get('/trigger-urgent-notifications', async (req, res) => {
  await sendUrgentNotifications();
  res.json({ status: 'triggered' });
});

router.get('/trigger-daily-digest', async (req, res) => {
  await sendDailyDigest();
  res.json({ status: 'triggered' });
});


router.get('/propose-slots/:userId', async (req, res) => {
  const slots = await proposeAvailableSlots(req.params.userId, {
    durationMins: 30,
    daysToSearch: 5,
    maxSlotsToReturn: 3,
  });
  res.json({ slots });
});
export default router;