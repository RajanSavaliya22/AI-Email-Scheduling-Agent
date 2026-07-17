// src/routes/auth.ts
import express from 'express';
import passport from 'passport';

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

router.get('/google', passport.authenticate('google', {
  scope: [
    'profile',
    'email',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/calendar',
  ],
  accessType: 'offline',
  prompt: 'consent',
}));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND_URL}/login-failed` }),
  (req, res) => {
    res.redirect(FRONTEND_URL);
  }
);

router.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  res.json(req.user);
});


router.get('/logout', (req, res) => {
  req.logout(() => res.redirect(FRONTEND_URL));
});

export default router;