const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
// Retrieves the profile for the currently authenticated user
router.get('/me', requireAuth, async (req, res) => {
  try {
    // req.user is populated by the requireAuth middleware
    const { rows: [userProfile] } = await db.query(
      `SELECT p.id, p.username, p.is_admin, p.avatar_url, p.bio, p.created_at, u.email
       FROM profiles p
       JOIN auth.users u ON p.id = u.id
       WHERE p.id = $1`,
      [req.user.userId]
    );

    if (!userProfile) {
      // This can happen if a user is authenticated but has no profile entry.
      // We can create one on the fly or return an error.
      // For now, returning an error is safer.
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Also get user's game stats
    const { rows: [stats] } = await db.query(
      `SELECT COUNT(DISTINCT g.id)::int AS game_count,
              COALESCE(SUM(g.likes), 0)::int AS total_likes,
              COALESCE(SUM(g.play_count), 0)::int AS total_plays
       FROM games g
       WHERE g.user_id = $1`,
       [req.user.userId]
    );

    const user = { ...userProfile, ...stats };

    res.json(user);
  } catch (err) {
    console.error('Error fetching user profile:', err);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// ─── PATCH /api/auth/me ──────────────────────────────────────────────────────
// Updates the profile for the currently authenticated user
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
        'SELECT id FROM profiles WHERE LOWER(username) = LOWER($1) AND id != $2',
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
      `UPDATE profiles SET ${updates.join(', ')} WHERE id = $${p}
       RETURNING id, username, is_admin, avatar_url, bio, created_at`,
      params
    );
    res.json(user);
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;
