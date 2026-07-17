// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth';
import devRoutes from './routes/dev';
import settingsRoutes from './routes/settings';
import actionRoutes from './routes/actions';
import { startScheduledJobs } from './jobs/scheduler';

dotenv.config();

const app = express();

// 1. CORS — must be first, applies to ALL routes below
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));

// 2. Body parsing
app.use(express.json());

// 3. Session — ONE call only, with full cookie config
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    secure: false,
    httpOnly: true,
  },
}));

// 4. Passport — must come after session, before routes
app.use(passport.initialize());
app.use(passport.session());

// 5. Routes — now everything below has CORS + session + passport applied
app.use('/auth', authRoutes);
app.use('/dev', devRoutes);
app.use('/settings', settingsRoutes);
app.use('/actions', actionRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});

startScheduledJobs();