// src/routes/dev.ts
import express from 'express';
import { ingestEmailsForAllUsers } from '../jobs/emailIngestionJob';

const router = express.Router();

router.get('/trigger-ingestion', async (req, res) => {
  await ingestEmailsForAllUsers();
  res.json({ status: 'triggered' });
});

export default router;