const express   = require('express');
const router    = express.Router();
const pool      = require('../db');
const { createClient } = require('@supabase/supabase-js');

// ─── Auth middleware ──────────────────────────────────────────────────────────

function adminAuth(req, res, next) {
  const pw = req.headers['x-admin-password'];
  if (!process.env.ADMIN_PASSWORD || pw !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

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

    // Delete Supabase Storage files (best-effort — don't fail the request if storage errors)
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    // 1. Delete game files folder
    const { data: fileList } = await supabase.storage
      .from('games')
      .list(`files/${game.id}`, { limit: 1000 });
    if (fileList?.length) {
      await supabase.storage.from('games').remove(
        fileList.map(f => `files/${game.id}/${f.name}`)
      );
    }

    // 2. Delete thumbnail (stored as full URL → extract storage path)
    if (game.thumbnail?.includes('/storage/v1/object/public/games/')) {
      const storagePath = game.thumbnail.split('/storage/v1/object/public/games/')[1];
      if (storagePath) {
        await supabase.storage.from('games').remove([storagePath]).catch(() => {});
      }
    }

    // Delete from DB (CASCADE removes comments + ratings)
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
