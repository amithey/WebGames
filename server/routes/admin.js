const express   = require('express');
const router    = express.Router();
const crypto    = require('crypto');
const jwt       = require('jsonwebtoken');
const pool      = require('../db');
const { createClient } = require('@supabase/supabase-js');
const { adminLoginLimiter } = require('../middleware/rateLimiter');

// ─── JWT helpers ──────────────────────────────────────────────────────────────

// JWT_SECRET must be set in production — a random fallback is generated per
// process start (tokens don't survive restarts in dev, which is fine).
const JWT_SECRET  = process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex');
const JWT_EXPIRES = '8h';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set — tokens will be invalidated on every cold start. Set JWT_SECRET in production.');
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.slice(7);
  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
  }
}

// ─── POST /api/admin/login ────────────────────────────────────────────────────

router.post('/login', adminLoginLimiter, (req, res) => {
  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'Password required' });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return res.status(500).json({ error: 'Admin not configured' });
  }

  // Timing-safe comparison to prevent timing attacks
  let match = false;
  try {
    const a = Buffer.from(password);
    const b = Buffer.from(adminPassword);
    match = a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    match = false;
  }

  if (!match) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, expiresIn: JWT_EXPIRES });
});

// All routes below require a valid JWT
router.use(adminAuth);

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const [{ rows: [games] }, { rows: [comments] }] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)::int             AS total_games,
          COALESCE(SUM(likes), 0)   AS total_likes,
          COALESCE(SUM(play_count),0) AS total_plays
        FROM games
      `),
      pool.query('SELECT COUNT(*)::int AS total_comments FROM comments'),
    ]);
    res.json({
      totalGames:    games.total_games,
      totalLikes:    parseInt(games.total_likes),
      totalPlays:    parseInt(games.total_plays),
      totalComments: comments.total_comments,
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── GET /api/admin/games ─────────────────────────────────────────────────────

router.get('/games', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT g.id, g.title, g.author, g.likes, g.play_count, g.featured, g.created_at,
        COUNT(DISTINCT c.id)::int AS comment_count,
        COUNT(DISTINCT r.id)::int AS rating_count,
        COALESCE(AVG(r.rating)::numeric(3,1), 0)::float AS avg_rating
      FROM games g
      LEFT JOIN comments c ON c.game_id = g.id
      LEFT JOIN ratings  r ON r.game_id = g.id
      GROUP BY g.id
      ORDER BY g.created_at DESC
    `);
    res.json(rows.map(r => ({
      id:           r.id,
      title:        r.title,
      author:       r.author || 'Anonymous',
      likes:        r.likes,
      playCount:    r.play_count,
      featured:     r.featured,
      createdAt:    r.created_at,
      commentCount: r.comment_count,
      ratingCount:  r.rating_count,
      avgRating:    r.avg_rating,
    })));
  } catch (err) {
    console.error('Error fetching admin games:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// ─── DELETE /api/admin/games/:id ─────────────────────────────────────────────

router.delete('/games/:id', async (req, res) => {
  try {
    const { rows: [game] } = await pool.query(
      'SELECT id, thumbnail FROM games WHERE id = $1', [req.params.id]
    );
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { data: fileList } = await supabase.storage
      .from('games')
      .list(`files/${game.id}`, { limit: 1000 });
    if (fileList?.length) {
      await supabase.storage.from('games').remove(
        fileList.map(f => `files/${game.id}/${f.name}`)
      );
    }

    if (game.thumbnail?.includes('/storage/v1/object/public/games/')) {
      const storagePath = game.thumbnail.split('/storage/v1/object/public/games/')[1];
      if (storagePath) {
        await supabase.storage.from('games').remove([storagePath]).catch(() => {});
      }
    }

    await pool.query('DELETE FROM games WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting game:', err);
    res.status(500).json({ error: 'Failed to delete game' });
  }
});

// ─── PATCH /api/admin/games/:id/feature ──────────────────────────────────────

router.patch('/games/:id/feature', async (req, res) => {
  try {
    const { rows: [updated] } = await pool.query(
      'UPDATE games SET featured = NOT featured WHERE id = $1 RETURNING id, featured',
      [req.params.id]
    );
    if (!updated) return res.status(404).json({ error: 'Game not found' });
    res.json({ id: updated.id, featured: updated.featured });
  } catch (err) {
    console.error('Error toggling feature:', err);
    res.status(500).json({ error: 'Failed to toggle feature' });
  }
});

module.exports = router;
