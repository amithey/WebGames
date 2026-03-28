const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// Reuse the same camelCase mapper from games.js inline (avoids circular require)
function formatGame(row) {
  return {
    id:          row.id,
    title:       row.title,
    description: row.description || '',
    author:      row.author || '',
    tags:        row.tags ? JSON.parse(row.tags) : [],
    thumbnail:   row.thumbnail || null,
    playCount:   row.play_count  || 0,
    fileType:    row.file_type   || 'html',
    likes:       row.likes       || 0,
    createdAt:   row.created_at,
    fileUrl:     row.file_url    || null,
  };
}

// GET /api/creators/:name — profile stats + all games
router.get('/:name', async (req, res) => {
  try {
    const name = req.params.name;
    const { rows } = await pool.query(
      'SELECT * FROM games WHERE author = $1 ORDER BY created_at DESC',
      [name]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Creator not found' });

    const games = rows.map(formatGame);
    const totalLikes = games.reduce((sum, g) => sum + g.likes, 0);
    const totalPlays = games.reduce((sum, g) => sum + g.playCount, 0);

    res.json({ name, totalGames: games.length, totalLikes, totalPlays, games });
  } catch (err) {
    console.error('Error fetching creator:', err);
    res.status(500).json({ error: 'Failed to fetch creator profile' });
  }
});

module.exports = router;
