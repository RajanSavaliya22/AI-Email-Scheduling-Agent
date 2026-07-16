// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
// src/index.ts
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth';
import { startScheduledJobs } from './jobs/scheduler';
import devRoutes from './routes/dev';
import settingsRoutes from './routes/settings';
import actionRoutes from './routes/actions';


dotenv.config();

const app = express();
app.use(express.json());
app.use(session({ secret: process.env.SESSION_SECRET!, resave: false, saveUninitialized: false }));
app.use('/auth', authRoutes);
app.use('/dev', devRoutes);
app.use('/settings', settingsRoutes);
app.use('/actions', actionRoutes);

app.use(passport.initialize());
app.use(passport.session());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
startScheduledJobs();