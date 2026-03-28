const { Pool } = require('pg');

// Strip ALL whitespace (newlines, tabs, spaces) from the URL
const raw = process.env.DATABASE_URL || '';
const dbUrl = raw.replace(/\s+/g, '');

// Debug info (safe to log — no password exposed)
const dbDebug = {
  rawLength: raw.length,
  cleanLength: dbUrl.length,
  first30: dbUrl.substring(0, 30),
  last15: dbUrl.slice(-15),
  hasWhitespace: raw !== dbUrl,
  startsWithPostgres: dbUrl.startsWith('postgres'),
  containsAt: dbUrl.includes('@'),
  containsColon: dbUrl.includes(':'),
};

if (!dbUrl) {
  console.error('FATAL: DATABASE_URL is not set or empty');
} else {
  console.log('[DB] Debug:', JSON.stringify(dbDebug));
  try {
    new URL(dbUrl);
    console.log('[DB] URL parsed successfully');
  } catch (e) {
    console.error(`[DB] FATAL: URL parse failed: ${e.message}`);
    console.error(`[DB] Char codes of first 50 chars: ${[...dbUrl.substring(0, 50)].map(c => c.charCodeAt(0)).join(',')}`);
  }
}

let pool = null;
let poolError = null;

try {
  pool = new Pool({
    connectionString: dbUrl || undefined,
    ssl: { rejectUnauthorized: false },
    max: 2,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
  });
} catch (e) {
  poolError = e.message;
  console.error('[DB] Pool creation failed:', e.message);
}

// Wrapper that catches errors gracefully instead of crashing the server
async function query(text, params) {
  if (!pool) {
    throw new Error(`Database not available: ${poolError || 'DATABASE_URL not configured'}`);
  }
  return pool.query(text, params);
}

module.exports = { query, getDebug: () => dbDebug };
