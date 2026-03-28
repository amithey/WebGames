const express  = require('express');
const router   = express.Router();
const multer   = require('multer');
const path     = require('path');
const AdmZip   = require('adm-zip');
const { v4: uuidv4 } = require('uuid');
const pool     = require('../db');
const { uploadFile, deleteFolder, getMimeType } = require('../storage');
const { uploadLimiter, interactionLimiter } = require('../middleware/rateLimiter');

// ─── Input sanitization helpers ──────────────────────────────────────────────

function sanitizeText(value, maxLen) {
  if (!value || typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

// ─── Multer ──────────────────────────────────────────────────────────────────
// Vercel serverless has a ~4.5 MB body limit; keep multer limit at 4 MB to stay safe.

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'gameFile') {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(ext === '.html' || ext === '.zip' ? null : new Error('Only .html and .zip files are allowed'), ext === '.html' || ext === '.zip');
    } else if (file.fieldname === 'thumbnail') {
      cb(file.mimetype.startsWith('image/') ? null : new Error('Only image files are allowed for thumbnails'), file.mimetype.startsWith('image/'));
    } else {
      cb(null, true);
    }
  },
});

/** Multer error handler — returns user-friendly messages for file issues */
function handleMulterError(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large. Maximum size is 4 MB.' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err && err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Map a DB row (snake_case + computed cols) → camelCase API response */
function formatGame(row) {
  return {
    id:          row.id,
    title:       row.title,
    description: row.description || '',
    author:      row.author || '',
    tags:        row.tags ? JSON.parse(row.tags) : [],
    thumbnail:   row.thumbnail || null,
    playCount:   row.play_count   || 0,
    fileType:    row.file_type    || 'html',
    likes:       row.likes        || 0,
    featured:    row.featured     || false,
    createdAt:   row.created_at,
    fileUrl:     row.file_url     || null,
    avgRating:   row.avg_rating   ? parseFloat(row.avg_rating)   : 0,
    ratingCount: row.rating_count ? parseInt(row.rating_count)   : 0,
  };
}

/** SELECT that always includes avg rating + count */
const GAME_SELECT = `
  SELECT g.*,
    COALESCE(AVG(r.rating)::numeric(3,1), 0)  AS avg_rating,
    COUNT(DISTINCT r.id)::int                  AS rating_count
  FROM games g
  LEFT JOIN ratings r ON r.game_id = g.id
`;

/** Upload all entries of an in-memory ZIP to Supabase Storage under files/<id>/ */
async function uploadZip(buffer, id) {
  const zip     = new AdmZip(buffer);
  const entries = zip.getEntries().filter(e => !e.isDirectory);

  let prefix = '';
  const hasRootIndex = entries.some(e => e.entryName === 'index.html');
  if (!hasRootIndex) {
    const nested = entries.find(e => {
      const parts = e.entryName.split('/');
      return parts.length === 2 && parts[1] === 'index.html';
    });
    if (!nested) throw new Error('ZIP file must contain an index.html file');
    prefix = nested.entryName.slice(0, nested.entryName.indexOf('/') + 1);
  }

  let indexUrl = null;
  for (const entry of entries) {
    const rel = entry.entryName.startsWith(prefix)
      ? entry.entryName.slice(prefix.length)
      : entry.entryName;
    if (!rel) continue;
    const url = await uploadFile(`files/${id}/${rel}`, entry.getData(), getMimeType(rel));
    if (rel === 'index.html') indexUrl = url;
  }
  if (!indexUrl) throw new Error('Failed to upload index.html');
  return indexUrl;
}

// ─── GET /api/games ───────────────────────────────────────────────────────────
// Query params: sort, search, tag (multi), minLikes, minPlays

router.get('/', async (req, res) => {
  try {
    const sort     = req.query.sort || 'recent';
    const search   = req.query.search?.trim() || '';
    const tags     = [req.query.tag].flat().filter(Boolean); // ?tag=A&tag=B
    const minLikes = parseInt(req.query.minLikes) || 0;
    const minPlays = parseInt(req.query.minPlays) || 0;

    const sortMap = {
      liked:  'g.likes DESC, g.created_at DESC',
      played: 'g.play_count DESC, g.created_at DESC',
      recent: 'g.created_at DESC',
      alpha:  'g.title ASC',
      rated:  'avg_rating DESC, rating_count DESC',
    };
    const orderBy = sortMap[sort] || sortMap.recent;

    // Build dynamic WHERE clause
    const conditions = ['TRUE'];
    const params     = [];
    let   p          = 1;

    if (search) {
      conditions.push(`(g.title ILIKE $${p} OR g.description ILIKE $${p})`);
      params.push(`%${search}%`);
      p++;
    }
    if (minLikes > 0) {
      conditions.push(`g.likes >= $${p}`);
      params.push(minLikes);
      p++;
    }
    if (minPlays > 0) {
      conditions.push(`g.play_count >= $${p}`);
      params.push(minPlays);
      p++;
    }

    const sql = `
      ${GAME_SELECT}
      WHERE ${conditions.join(' AND ')}
      GROUP BY g.id
      ORDER BY g.featured DESC, ${orderBy}
    `;

    let { rows } = await pool.query(sql, params);

    // Tag filtering is done in JS (tags are stored as JSON text)
    if (tags.length > 0) {
      rows = rows.filter(row => {
        const gameTags = row.tags ? JSON.parse(row.tags) : [];
        return tags.every(t => gameTags.includes(t));
      });
    }

    res.json(rows.map(formatGame));
  } catch (err) {
    console.error('Error fetching games:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// ─── POST /api/games — upload a new game ─────────────────────────────────────

router.post('/', uploadLimiter, upload.fields([{ name: 'gameFile', maxCount: 1 }, { name: 'thumbnail', maxCount: 1 }]), handleMulterError, async (req, res) => {
  const title       = sanitizeText(req.body.title, 100);
  const description = sanitizeText(req.body.description, 500);
  const author      = sanitizeText(req.body.author, 80);
  const tags        = sanitizeText(req.body.tags, 200);

  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!req.files?.gameFile) return res.status(400).json({ error: 'A game file (.html or .zip) is required' });

  const gameFile = req.files.gameFile[0];
  const ext      = path.extname(gameFile.originalname).toLowerCase();
  if (ext !== '.html' && ext !== '.zip')
    return res.status(400).json({ error: 'Only .html and .zip files are allowed' });

  const id = uuidv4();
  let fileUrl = null, thumbnailUrl = null;

  try {
    fileUrl = ext === '.html'
      ? await uploadFile(`files/${id}/index.html`, gameFile.buffer, 'text/html')
      : await uploadZip(gameFile.buffer, id);

    if (req.files.thumbnail?.[0]) {
      const thumb    = req.files.thumbnail[0];
      const thumbExt = path.extname(thumb.originalname).toLowerCase() || '.png';
      thumbnailUrl   = await uploadFile(`thumbnails/${id}${thumbExt}`, thumb.buffer, thumb.mimetype);
    }

    const tagsArray = tags
      ? tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 10)
      : [];

    await pool.query(
      `INSERT INTO games (id, title, description, author, tags, thumbnail, file_type, file_url)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [id, title, description, author, JSON.stringify(tagsArray), thumbnailUrl, ext.slice(1), fileUrl]
    );

    const { rows: [game] } = await pool.query(
      `${GAME_SELECT} WHERE g.id = $1 GROUP BY g.id`, [id]
    );
    res.status(201).json(formatGame(game));
  } catch (err) {
    if (id) await deleteFolder(`files/${id}`).catch(() => {});
    console.error('Error uploading game:', err);
    // Return specific error message if available, otherwise generic
    const message = err.message || 'Failed to upload game';
    res.status(500).json({ error: message });
  }
});

// ─── GET /api/games/:id ───────────────────────────────────────────────────────

router.get('/:id', async (req, res) => {
  try {
    const { rows: [game] } = await pool.query(
      `${GAME_SELECT} WHERE g.id = $1 GROUP BY g.id`, [req.params.id]
    );
    if (!game) return res.status(404).json({ error: 'Game not found' });
    res.json(formatGame(game));
  } catch (err) {
    console.error('Error fetching game:', err);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// ─── GET /api/games/:id/play ──────────────────────────────────────────────────

router.get('/:id/play', async (req, res) => {
  try {
    const { rows: [game] } = await pool.query('SELECT file_url FROM games WHERE id = $1', [req.params.id]);
    if (!game)           return res.status(404).json({ error: 'Game not found' });
    if (!game.file_url)  return res.status(404).json({ error: 'Game file not found' });
    res.redirect(game.file_url);
  } catch (err) {
    console.error('Error serving game:', err);
    res.status(500).json({ error: 'Failed to serve game' });
  }
});

// ─── POST /api/games/:id/like ─────────────────────────────────────────────────

router.post('/:id/like', interactionLimiter, async (req, res) => {
  try {
    const { rows: [updated] } = await pool.query(
      'UPDATE games SET likes = likes + 1 WHERE id = $1 RETURNING likes',
      [req.params.id]
    );
    if (!updated) return res.status(404).json({ error: 'Game not found' });
    res.json({ likes: updated.likes });
  } catch (err) {
    console.error('Error liking game:', err);
    res.status(500).json({ error: 'Failed to like game' });
  }
});

// ─── PATCH /api/games/:id/increment ──────────────────────────────────────────

router.patch('/:id/increment', async (req, res) => {
  try {
    const { rows: [updated] } = await pool.query(
      'UPDATE games SET play_count = play_count + 1 WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (!updated) return res.status(404).json({ error: 'Game not found' });
    res.json(formatGame(updated));
  } catch (err) {
    console.error('Error incrementing play count:', err);
    res.status(500).json({ error: 'Failed to increment play count' });
  }
});

// ─── POST /api/games/:id/rate ─────────────────────────────────────────────────

router.post('/:id/rate', interactionLimiter, async (req, res) => {
  try {
    const rating = parseInt(req.body.rating);
    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });

    const { rows: [game] } = await pool.query('SELECT id FROM games WHERE id = $1', [req.params.id]);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    await pool.query('INSERT INTO ratings (game_id, rating) VALUES ($1, $2)', [req.params.id, rating]);

    const { rows: [result] } = await pool.query(
      `SELECT COALESCE(AVG(rating)::numeric(3,1), 0)::float AS average,
              COUNT(*)::int                                  AS count
       FROM ratings WHERE game_id = $1`,
      [req.params.id]
    );
    res.json({ average: result.average, count: result.count });
  } catch (err) {
    console.error('Error rating game:', err);
    res.status(500).json({ error: 'Failed to rate game' });
  }
});

// ─── GET /api/games/:id/rating ────────────────────────────────────────────────

router.get('/:id/rating', async (req, res) => {
  try {
    const { rows: [result] } = await pool.query(
      `SELECT COALESCE(AVG(rating)::numeric(3,1), 0)::float AS average,
              COUNT(*)::int                                  AS count
       FROM ratings WHERE game_id = $1`,
      [req.params.id]
    );
    res.json({ average: result.average, count: result.count });
  } catch (err) {
    console.error('Error fetching rating:', err);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

// ─── GET /api/games/:id/comments ─────────────────────────────────────────────

router.get('/:id/comments', async (req, res) => {
  try {
    const { rows: [game] } = await pool.query('SELECT id FROM games WHERE id = $1', [req.params.id]);
    if (!game) return res.status(404).json({ error: 'Game not found' });
    const { rows } = await pool.query(
      'SELECT * FROM comments WHERE game_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching comments:', err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ─── POST /api/games/:id/comments ────────────────────────────────────────────

router.post('/:id/comments', interactionLimiter, async (req, res) => {
  try {
    const { rows: [game] } = await pool.query('SELECT id FROM games WHERE id = $1', [req.params.id]);
    if (!game) return res.status(404).json({ error: 'Game not found' });

    const content     = sanitizeText(req.body.content, 1000);
    const author_name = sanitizeText(req.body.author_name, 80) || 'Anonymous';
    if (!content) return res.status(400).json({ error: 'Comment content is required' });

    const { rows: [comment] } = await pool.query(
      'INSERT INTO comments (game_id, author_name, content) VALUES ($1,$2,$3) RETURNING *',
      [req.params.id, author_name, content]
    );
    res.status(201).json(comment);
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

module.exports = router;
