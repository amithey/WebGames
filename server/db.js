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
};

/**
 * Parse a postgres:// URL manually to avoid new URL() choking on
 * passwords that contain special characters like @, #, %, etc.
 * Returns { user, password, host, port, database, params } or null.
 */
function parseDbUrl(url) {
  // postgresql://user:password@host:port/database?params
  const match = url.match(/^postgres(?:ql)?:\/\/([^:]+):(.+)@([^:/?]+):?(\d+)?\/([^?]+)(\?.*)?$/);
  if (!match) return null;
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4] || '5432'),
    database: match[5],
    params: match[6] || '',
  };
}

let pool = null;
let poolError = null;

if (!dbUrl) {
  poolError = 'DATABASE_URL is not set or empty';
  console.error(`FATAL: ${poolError}`);
} else {
  const parsed = parseDbUrl(dbUrl);
  if (parsed) {
    const maskedPassword = parsed.password.substring(0, 3) + '***';
    console.log(`[DB] Connecting to: ${parsed.user}:${maskedPassword}@${parsed.host}:${parsed.port}/${parsed.database}`);
    try {
      pool = new Pool({
        user: parsed.user,
        password: parsed.password,
        host: parsed.host,
        port: parsed.port,
        database: parsed.database,
        ssl: { rejectUnauthorized: false },
        max: 2,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
      });
      dbDebug.parseMethod = 'manual';
    } catch (e) {
      poolError = `Pool creation failed (manual parse): ${e.message}`;
      console.error(`[DB] ${poolError}`);
    }
  } else {
    // Fallback: try connectionString directly (might work for simpler URLs)
    console.warn('[DB] Manual URL parse failed, trying connectionString directly');
    dbDebug.parseMethod = 'connectionString-fallback';
    try {
      pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
        max: 2,
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 10000,
      });
    } catch (e) {
      poolError = `Pool creation failed (connectionString): ${e.message}`;
      console.error(`[DB] ${poolError}`);
    }
  }
}

// Wrapper that catches errors gracefully instead of crashing the server
async function query(text, params) {
  if (!pool) {
    throw new Error(`Database not available: ${poolError || 'DATABASE_URL not configured'}`);
  }
  return pool.query(text, params);
}

module.exports = { query, getDebug: () => dbDebug };
