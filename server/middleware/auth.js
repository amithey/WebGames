const jwt = require('jsonwebtoken');
const db = require('../db');

// Supabase JWT Secret is required to verify tokens from the frontend
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET;

/** Attach req.user if valid Supabase token present; always calls next() */
async function optionalAuth(req, res, next) {
  req.user = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token) {
    try {
      // Supabase tokens are standard JWTs signed with the project's JWT secret
      const payload = jwt.verify(token, SUPABASE_JWT_SECRET);
      
      // Map Supabase payload to a standard user object
      // sub is the user UUID in Supabase/GoTrue
      req.user = {
        userId: payload.sub,
        email: payload.email,
        username: payload.user_metadata?.username || payload.email?.split('@')[0],
      };

      // Check if user is an admin in the profiles table
      try {
        const { rows } = await db.query('SELECT is_admin FROM profiles WHERE id = $1', [payload.sub]);
        req.user.isAdmin = rows[0]?.is_admin || false;
      } catch (e) {
        req.user.isAdmin = false;
      }
    } catch (err) {
      // Invalid token — treat as anonymous
    }
  }
  next();
}

/** Require valid token — 401 if missing/invalid */
async function requireAuth(req, res, next) {
  await optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    next();
  });
}

/** Require valid token + is_admin */
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

module.exports = { optionalAuth, requireAuth, requireAdmin };
