import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import mongoose from 'mongoose';
import passport, { configurePassport } from './config/passport';
import Url from './models/Url';

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
  const { url, name, intervalMin } = req.body;

  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: "Please login first" });
  }

  // 1. check URL exists in body
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  // 2. validate URL format
  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format. Example: https://google.com" });
  }

  try {
    const user = req.user as any;
    const exist = await Url.findOne({ url: url, user: user._id });
    if (exist) {
      return res.status(400).json({ error: "You are already monitoring this URL" });
    }

  }
  catch (error) { res.status(400).json({ error: "Failed to validate URL" }); }

});

// ── Health Check ──
app.get('/', (req: Request, res: Response) => {
  res.send('URL Monitor API is running...');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
