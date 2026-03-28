require('dotenv').config();

// ── Validate required environment variables ──────────────────────────────────
const REQUIRED_ENV = ['DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`FATAL: Missing required environment variable: ${key}`);
  }
}

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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
];

if (process.env.FRONTEND_URL) {
  // Normalize by removing trailing slash
  const feUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
  allowedOrigins.push(feUrl);
  // Also push the .vercel.app variant if it's missing https://
  if (!feUrl.startsWith('http')) {
    allowedOrigins.push(`https://${feUrl}`);
  }
}

// In production, if FRONTEND_URL is not set, we might want to be more permissive 
// or at least log a very clear warning.
if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  FRONTEND_URL not set in production! CORS might block requests from your frontend.');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      return callback(null, true);
    }
    // For development/debugging, you might want to allow all vercel.app domains:
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    console.warn(`CORS blocked request from origin: ${origin}`);
    return callback(new Error('Not allowed by CORS'));
  },
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
