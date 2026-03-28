const { Pool } = require('pg');

const dbUrl = (process.env.DATABASE_URL || '').trim();

if (!dbUrl) {
  console.error('FATAL: DATABASE_URL is not set or empty');
} else {
  // Validate it's a parseable URL
  try {
    new URL(dbUrl);
    const masked = dbUrl.replace(/:([^@]+)@/, ':***@');
    console.log(`[DB] Connecting to: ${masked.substring(0, 60)}...`);
  } catch (e) {
    console.error(`FATAL: DATABASE_URL is not a valid URL (length: ${dbUrl.length}, starts: "${dbUrl.substring(0, 20)}...")`);
  }
}

const pool = new Pool({
  connectionString: dbUrl || 'postgresql://invalid:invalid@localhost:5432/invalid',
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
