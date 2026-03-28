require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const gamesRouter    = require('./routes/games');
const creatorsRouter = require('./routes/creators');
const adminRouter    = require('./routes/admin');
const { generalLimiter } = require('./middleware/rateLimiter');

const app = express();

// ── Security headers (helmet) ─────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:      ["'none'"],
      frameAncestors:  ["'none'"],
    },
  },
  // Allow cross-origin fetches from the frontend domain
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // COEP would break game iframes — leave disabled
  crossOriginEmbedderPolicy: false,
}));

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : ['http://localhost:5173'];

if (!process.env.FRONTEND_URL) {
  console.warn('⚠️  FRONTEND_URL not set — CORS restricted to localhost only. Set it in production.');
}

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// ── Body parsing with explicit size limits ────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Global rate limiting ──────────────────────────────────────────────────────
app.use(generalLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/games',    gamesRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/admin',    adminRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler (never leak stack traces) ────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: 'An unexpected error occurred' });
});

module.exports = app;
