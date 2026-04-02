const { createClient } = require('@supabase/supabase-js');
const db = require('../db');

// Supabase client used only for token verification — requires only the anon key.
const supabaseUrl = (process.env.SUPABASE_URL || '').replace(/\s+/g, '').replace(/\/+$/, '');
const supabaseKey = (process.env.SUPABASE_ANON_KEY || '').replace(/\s+/g, '');
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/** Attach req.user if valid Supabase token present; always calls next() */
async function optionalAuth(req, res, next) {
  req.user = null;
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (token && supabase) {
    try {
      // Verify the token via Supabase's auth API — no JWT secret needed.
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (!error && user) {
        req.user = {
          userId:   user.id,
          email:    user.email,
          username: user.user_metadata?.username || user.email?.split('@')[0],
        };

        // Check admin status in profiles table
        try {
          const { rows } = await db.query(
            'SELECT is_admin FROM profiles WHERE id = $1', [user.id]
          );
          req.user.isAdmin = rows[0]?.is_admin || false;
        } catch {
          req.user.isAdmin = false;
        }
      }
    } catch {
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
