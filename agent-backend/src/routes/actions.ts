// src/routes/actions.ts
import express from 'express';
import { editDraft, rejectDraft, approveAndSend } from '../services/emailActionServices';
import { confirmProposedEvent, cancelProposedEvent } from '../services/calendarActionServices';

const router = express.Router();

// Email draft actions
router.get('/pending-drafts/:userId', async (req, res) => {
  const { prisma } = await import('../config/db');
  const drafts = await prisma.email.findMany({
    where: { userId: req.params.userId, status: 'draft_pending' },
    orderBy: { receivedAt: 'desc' },
  });
  res.json(drafts);
});

router.put('/drafts/:emailId', async (req, res) => {
  const { editedReply } = req.body;
  const updated = await editDraft(req.params.emailId, editedReply);
  res.json(updated);
});

router.post('/drafts/:emailId/reject', async (req, res) => {
  const updated = await rejectDraft(req.params.emailId);
  res.json(updated);
});

router.post('/drafts/:emailId/approve', async (req, res) => {
  const { userId } = req.body;
  try {
    const sent = await approveAndSend(userId, req.params.emailId);
    res.json(sent);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Calendar actions
router.post('/events/:eventId/confirm', async (req, res) => {
  const { userId } = req.body;
  try {
    const confirmed = await confirmProposedEvent(userId, req.params.eventId);
    res.json(confirmed);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/events/:eventId/cancel', async (req, res) => {
  const { userId } = req.body;
  const cancelled = await cancelProposedEvent(userId, req.params.eventId);
  res.json(cancelled);
});

export default router;