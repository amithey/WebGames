require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Trust proxy (required behind Vercel/CDN — fixes express-rate-limit) ─────
app.set('trust proxy', 1);

// ── CORS (must be FIRST, before helmet and everything else) ─────────────────
const FRONTEND_ORIGIN = 'https://web-games-mauve.vercel.app';
const allowedOrigins = [
  FRONTEND_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
];
// Also allow FRONTEND_URL env var (trimmed — Vercel sometimes adds trailing newlines)
if (process.env.FRONTEND_URL) {
  const feUrl = process.env.FRONTEND_URL.trim().replace(/\/+$/, '');
  if (feUrl && !allowedOrigins.includes(feUrl)) allowedOrigins.push(feUrl);
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Security headers (helmet) ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:      ["'none'"],
      frameAncestors:  ["'none'"],
    },
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// ── Body parsing with explicit size limits ────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Global rate limiting ──────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Health check (before routes so it always works) ──────────────────────────
app.get('/api/health', async (_req, res) => {
  const envStatus = {
    DATABASE_URL:      !!process.env.DATABASE_URL,
    SUPABASE_URL:      !!process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
    FRONTEND_URL:      (process.env.FRONTEND_URL || '(not set)').trim(),
    NODE_ENV:          process.env.NODE_ENV || '(not set)',
  };

  // DB debug info (shows URL shape without exposing password)
  let dbDebug = null;
  let dbConnTest = 'not tested';
  try {
    const db = require('./db');
    dbDebug = db.getDebug();
    // Try a simple query to test the connection
    await db.query('SELECT 1');
    dbConnTest = 'ok';
  } catch (e) {
    dbConnTest = `failed: ${e.message}`;
  }

  // Storage status
  let storageStatus = 'unknown';
  try {
    const { getStorageStatus } = require('./storage');
    storageStatus = getStorageStatus() || 'ok';
  } catch (e) {
    storageStatus = `failed to load: ${e.message}`;
  }

  res.json({ status: 'ok', env: envStatus, db: { debug: dbDebug, connection: dbConnTest }, storage: storageStatus });
});

// ── Routes (lazy-loaded to catch require-time crashes) ───────────────────────
try {
  const gamesRouter    = require('./routes/games');
  const creatorsRouter = require('./routes/creators');
  const adminRouter    = require('./routes/admin');

  app.use('/api/games',    gamesRouter);
  app.use('/api/creators', creatorsRouter);
  app.use('/api/admin',    adminRouter);
} catch (err) {
  console.error('Failed to load routes:', err);
  // If routes fail to load, return 500 with info on all API endpoints
  app.use('/api', (_req, res) => {
    res.status(500).json({ error: 'Server initialization failed', detail: err.message });
  });
}

// ── Global error handler (never leak stack traces) ────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  // Ensure CORS headers are present on error responses
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
  }
  res.status(err.status || 500).json({ error: 'An unexpected error occurred' });
});

module.exports = app;
