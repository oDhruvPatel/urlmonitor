import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import mongoose from 'mongoose';
import passport, { configurePassport } from './config/passport';
import Monitor from './models/Url';
import { redisCache } from './config/redis';


dotenv.config();
configurePassport();


const app = express();
const port = process.env.PORT || 5000;

// ── MongoDB ──
mongoose
  .connect(process.env.MONGODB_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ── Middleware ──
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ── Auth Routes ──

// Start Google OAuth flow
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get(
  '/auth/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}?error=auth_failed`,
  }),
  (req: Request, res: Response) => {
    // Successful auth — redirect to frontend
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  }
);

// Get current logged-in user
app.get('/auth/user', (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    const user = req.user as any;
    res.json({
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      avatar: user.avatar,
    });
  } else {
    res.json(null);
  }
});

// Logout
app.get('/auth/logout', (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.redirect(process.env.CLIENT_URL || 'http://localhost:5173');
  });
});

app.post('/api/submitURL', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Please login first" });
  }

  const { url, name, intervalMinutes } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format. Example: https://google.com" });
  }

  const VALID_INTERVALS = [1, 5, 10, 30, 60];
  if (intervalMinutes && !VALID_INTERVALS.includes(Number(intervalMinutes))) {
    return res.status(400).json({ error: `intervalMinutes must be one of: ${VALID_INTERVALS.join(", ")}` });
  }

  try {
    const user = req.user as any;
    const exists = await Monitor.findOne({ url, user: user._id });
    if (exists) {
      return res.status(409).json({ error: "You are already monitoring this URL" });
    }

    const monitor = new Monitor({ url, name: name || url, intervalMinutes, user: user._id });
    await monitor.save();
    return res.status(201).json({ message: "URL added successfully", url: monitor });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Get all monitors for logged-in user ──
app.get('/api/monitors', async (req: Request, res: Response) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Please login first" });
  }

  try {
    const user = req.user as any;
    const monitors = await Monitor.find({ user: user._id }).sort({ createdAt: -1 });
    return res.json(monitors);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


app.get('/', async (req: Request, res: Response) => {

});

// ── Health Check ──
app.get('/', (req: Request, res: Response) => {
  res.send('URL Monitor API is running...');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
