const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { optionalAuth, requireAuth } = require('../middleware/auth');

function formatGame(row) {
  return {
    id:           row.id,
    title:        row.title,
    description:  row.description || '',
    author:       row.author || '',
    tags:         row.tags ? (typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags) : [],
    thumbnail:    row.thumbnail || null,
    thumbnailUrl: row.thumbnail_url || null,
    playCount:    row.play_count   || 0,
    fileType:     row.file_type    || 'html',
    likes:        row.likes        || 0,
    aiTool:       row.ai_tool      || null,
    category:     row.category     || null,
    createdAt:    row.created_at,
    fileUrl:      row.file_url     || null,
  };
}

// GET /api/creators/:name
router.get('/:name', optionalAuth, async (req, res) => {
  try {
    const name = req.params.name;
    const { rows } = await db.query(
      'SELECT * FROM games WHERE author = $1 ORDER BY created_at DESC',
      [name]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Creator not found' });

    const games = rows.map(formatGame);
    const totalLikes = games.reduce((sum, g) => sum + g.likes, 0);
    const totalPlays = games.reduce((sum, g) => sum + g.playCount, 0);

    // Follower count
    const { rows: [fc] } = await db.query(
      'SELECT COUNT(*)::int AS count FROM user_follows WHERE following_username = $1',
      [name]
    );

    // Is current user following?
    let isFollowing = false;
    if (req.user) {
      const { rows: f } = await db.query(
        'SELECT 1 FROM user_follows WHERE follower_id = $1 AND following_username = $2',
        [req.user.userId, name]
      );
      isFollowing = f.length > 0;
    }

    res.json({ name, totalGames: games.length, totalLikes, totalPlays, followerCount: fc.count, isFollowing, games });
  } catch (err) {
    console.error('Error fetching creator:', err);
    res.status(500).json({ error: 'Failed to fetch creator profile' });
  }
});

// POST /api/creators/:name/follow
router.post('/:name/follow', requireAuth, async (req, res) => {
  try {
    await db.query(
      'INSERT INTO user_follows (follower_id, following_username) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.userId, req.params.name]
    );
    const { rows: [fc] } = await db.query(
      'SELECT COUNT(*)::int AS count FROM user_follows WHERE following_username = $1',
      [req.params.name]
    );
    res.json({ isFollowing: true, followerCount: fc.count });
  } catch (err) {
    console.error('Error following creator:', err);
    res.status(500).json({ error: 'Failed to follow creator' });
  }
});

// POST /api/creators/:name/unfollow
router.post('/:name/unfollow', requireAuth, async (req, res) => {
  try {
    await db.query(
      'DELETE FROM user_follows WHERE follower_id = $1 AND following_username = $2',
      [req.user.userId, req.params.name]
    );
    const { rows: [fc] } = await db.query(
      'SELECT COUNT(*)::int AS count FROM user_follows WHERE following_username = $1',
      [req.params.name]
    );
    res.json({ isFollowing: false, followerCount: fc.count });
  } catch (err) {
    console.error('Error unfollowing creator:', err);
    res.status(500).json({ error: 'Failed to unfollow creator' });
  }
});

module.exports = router;
