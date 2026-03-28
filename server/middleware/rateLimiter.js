const rateLimit = require('express-rate-limit');

// Note: uses in-memory store — effective per serverless instance.
// For multi-region production, replace with a Redis-backed store.

/** General API: 200 req / 15 min per IP */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

/** Admin login: 10 attempts / 15 min per IP (brute-force protection) */
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many login attempts. Please try again later.' },
});

/** Game uploads: 10 / hour per IP */
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Upload limit reached. Please try again in an hour.' },
});

/** Likes / ratings / comments: 30 / min per IP */
const interactionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Slow down! Too many requests.' },
});

module.exports = { generalLimiter, adminLoginLimiter, uploadLimiter, interactionLimiter };
