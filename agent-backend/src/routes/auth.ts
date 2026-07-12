// src/routes/auth.ts
import express from 'express';
import passport from 'passport';

const router = express.Router();

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
  passport.authenticate('google', { failureRedirect: '/login-failed' }),
  (req, res) => {
    res.redirect('/dashboard'); // or wherever your frontend lives
  }
);

router.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/'));
});

export default router;