// src/routes/settings.ts
import express from 'express';
import {
  getOrCreatePreferences,
  updatePreferences,
  addVipContact,
  removeVipContact,
} from '../services/preferenceService';
import { isValidTone } from '../types/preferences';

const router = express.Router();

// Middleware assumption: req.user.id available via Passport session
// For dev/testing without full auth wired to routes yet, accept userId as param

router.get('/:userId', async (req, res) => {
  const prefs = await getOrCreatePreferences(req.params.userId);
  res.json(prefs);
});


router.put('/:userId', async (req, res) => {
  if (req.body.tonePreference && !isValidTone(req.body.tonePreference)) {
    return res.status(400).json({ error: 'Invalid tonePreference value' });
  }
  const updated = await updatePreferences(req.params.userId, req.body);
  res.json(updated);
});

router.post('/:userId/vip', async (req, res) => {
  const { email, label } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });
  const contact = await addVipContact(req.params.userId, email, label);
  res.json(contact);
});

router.delete('/:userId/vip', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });
  await removeVipContact(req.params.userId, email);
  res.json({ status: 'removed' });
});

export default router;