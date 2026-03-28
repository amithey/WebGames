require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── CORS (must be FIRST, before helmet and everything else) ─────────────────
const FRONTEND_ORIGIN = 'https://web-games-mauve.vercel.app';

app.use(cors({
  origin: [
    FRONTEND_ORIGIN,
    'http://localhost:5173',
    'http://localhost:3000',
  ],
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
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

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
  if (origin === FRONTEND_ORIGIN || origin === 'http://localhost:5173' || origin === 'http://localhost:3000') {
    res.set('Access-Control-Allow-Origin', origin);
    res.set('Access-Control-Allow-Credentials', 'true');
  }
  res.status(err.status || 500).json({ error: 'An unexpected error occurred' });
});

module.exports = app;
