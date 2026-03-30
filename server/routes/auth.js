const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { generateToken, requireAuth } = require('../middleware/auth');
const { adminLoginLimiter } = require('../middleware/rateLimiter');

// ─── POST /api/auth/register ─────────────────────────────────────────────────

router.post('/register', adminLoginLimiter, async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Validate username
    const cleanUsername = username.trim();
    if (cleanUsername.length < 3 || cleanUsername.length > 30) {
      return res.status(400).json({ error: 'Username must be 3-30 characters' });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(cleanUsername)) {
      return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and hyphens' });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check uniqueness
    const { rows: existing } = await db.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2)',
      [email.trim(), cleanUsername]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email or username already taken' });
    }

    // Hash password and insert
    const passwordHash = await bcrypt.hash(password, 12);
    const { rows: [user] } = await db.query(
      `INSERT INTO users (email, username, password_hash)
       VALUES (LOWER($1), $2, $3)
       RETURNING id, email, username, is_admin, avatar_url, bio, created_at`,
      [email.trim(), cleanUsername, passwordHash]
    );

    const token = generateToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register' });
  }
});

// ─── POST /api/auth/login ────────────────────────────────────────────────────

router.post('/login', adminLoginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { rows: [user] } = await db.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        is_admin: user.is_admin,
        avatar_url: user.avatar_url,
        bio: user.bio,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req, res) => {
  try {
    const { rows: [user] } = await db.query(
      `SELECT u.id, u.email, u.username, u.is_admin, u.avatar_url, u.bio, u.created_at,
              COUNT(DISTINCT g.id)::int AS game_count,
              COALESCE(SUM(g.likes), 0)::int AS total_likes,
              COALESCE(SUM(g.play_count), 0)::int AS total_plays
       FROM users u
       LEFT JOIN games g ON LOWER(g.author) = LOWER(u.username)
       WHERE u.id = $1
       GROUP BY u.id`,
      [req.user.userId]
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ─── PATCH /api/auth/me ──────────────────────────────────────────────────────

router.patch('/me', requireAuth, async (req, res) => {
  try {
    const { username, bio, avatar_url } = req.body;
    const updates = [];
    const params = [];
    let p = 1;

    if (username !== undefined) {
      const clean = username.trim();
      if (clean.length < 3 || clean.length > 30) {
        return res.status(400).json({ error: 'Username must be 3-30 characters' });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(clean)) {
        return res.status(400).json({ error: 'Username can only contain letters, numbers, underscores, and hyphens' });
      }
      // Check uniqueness
      const { rows } = await db.query(
        'SELECT id FROM users WHERE LOWER(username) = LOWER($1) AND id != $2',
        [clean, req.user.userId]
      );
      if (rows.length > 0) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      updates.push(`username = $${p}`);
      params.push(clean);
      p++;
    }

    if (bio !== undefined) {
      updates.push(`bio = $${p}`);
      params.push((bio || '').slice(0, 500));
      p++;
    }

    if (avatar_url !== undefined) {
      updates.push(`avatar_url = $${p}`);
      params.push(avatar_url || null);
      p++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.user.userId);
    const { rows: [user] } = await db.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${p}
       RETURNING id, email, username, is_admin, avatar_url, bio, created_at`,
      params
    );
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ─── GET /api/auth/notifications ─────────────────────────────────────────────

router.get('/notifications', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [req.user.userId]
    );
    const { rows: [{ count }] } = await db.query(
      'SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND read = false',
      [req.user.userId]
    );
    res.json({ notifications: rows, unreadCount: count });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ─── PATCH /api/auth/notifications/read ──────────────────────────────────────

router.patch('/notifications/read', requireAuth, async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET read = true WHERE user_id = $1 AND read = false',
      [req.user.userId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking notifications read:', err);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

module.exports = router;
