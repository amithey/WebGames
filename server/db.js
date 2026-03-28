const { Pool } = require('pg');

// Keep pool small — Supabase free tier allows 60 connections total,
// and each Vercel serverless invocation creates a new process.
// Use port 6543 (Supabase PgBouncer) in production for connection pooling:
//   postgresql://postgres:[pw]@db.[ref].supabase.co:6543/postgres?pgbouncer=true
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

module.exports = pool;
