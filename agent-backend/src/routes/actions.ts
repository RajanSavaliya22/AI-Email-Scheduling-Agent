// src/routes/actions.ts
import express from 'express';
import { editDraft, rejectDraft, approveAndSend } from '../services/emailActionServices';
import { confirmProposedEvent, cancelProposedEvent } from '../services/calendarActionServices';
import { requireAuth } from '../middleware/requireAuth';
import { prisma } from '../config/db';

const router = express.Router();

// Email draft actions
router.get('/pending-drafts', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const drafts = await prisma.email.findMany({
    where: { userId, status: 'draft_pending' },
    orderBy: { receivedAt: 'desc' },
  });
  res.json(drafts);
});


router.put('/drafts/:emailId', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const emailId = req.params.emailId as string;
  const editedReply = req.body.editedReply as string;
  try {
    const updated = await editDraft(userId, emailId, editedReply);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/drafts/:emailId/reject', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const emailId = req.params.emailId as string;
  try {
    const updated = await rejectDraft(userId, emailId);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/drafts/:emailId/approve', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const emailId = req.params.emailId as string;
  try {
    const sent = await approveAndSend(userId, emailId);
    res.json(sent);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

// Calendar actions
router.post('/events/:eventId/confirm', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const eventId = req.params.eventId as string;
  try {
    const confirmed = await confirmProposedEvent(userId, eventId);
    res.json(confirmed);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.post('/events/:eventId/cancel', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const eventId = req.params.eventId as string;
  try {
    const cancelled = await cancelProposedEvent(userId, eventId);
    res.json(cancelled);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

router.get('/pending-events', requireAuth, async (req, res) => {
  const userId = (req.user as any).id;
  const events = await prisma.calendarEvent.findMany({
    where: { userId, status: 'proposed' },
    orderBy: { startTime: 'asc' },
  });
  res.json(events);
});

export default router;