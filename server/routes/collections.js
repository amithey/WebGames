const express = require('express');
const router = express.Router();
const db = require('../db');

// ─── GET /api/collections ────────────────────────────────────────────────────

router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM collections ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch collections' });
  }
});

// ─── GET /api/collections/:id ────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const { rows: [collection] } = await db.query('SELECT * FROM collections WHERE id = $1', [req.params.id]);
    if (!collection) return res.status(404).json({ error: 'Collection not found' });
    
    // Fetch games in this collection
    if (collection.game_ids && collection.game_ids.length > 0) {
      const { rows: games } = await db.query('SELECT * FROM games WHERE id = ANY($1)', [collection.game_ids]);
      collection.games = games;
    } else {
      collection.games = [];
    }
    
    res.json(collection);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch collection' });
  }
});

module.exports = router;
