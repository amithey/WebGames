-- ============================================================
-- WebGames — Supabase PostgreSQL Schema
-- Run this once in Supabase: Dashboard → SQL Editor → New query
-- Safe to re-run (uses IF NOT EXISTS / DO blocks)
-- ============================================================

-- ── Core games table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
  id           TEXT        PRIMARY KEY,
  title        TEXT        NOT NULL,
  description  TEXT        DEFAULT '',
  author       TEXT        DEFAULT '',
  tags         TEXT        DEFAULT '[]',
  thumbnail    TEXT,
  thumbnail_url TEXT,
  play_count   INTEGER     DEFAULT 0,
  weekly_plays INTEGER     DEFAULT 0,
  file_type    TEXT,
  likes        INTEGER     DEFAULT 0,
  featured     BOOLEAN     DEFAULT false,
  is_trending  BOOLEAN     DEFAULT false,
  ai_tool      TEXT,
  category     TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  file_url     TEXT
);

-- ── Comments ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id          SERIAL      PRIMARY KEY,
  game_id     TEXT        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  parent_id   INTEGER     REFERENCES comments(id) ON DELETE CASCADE,
  author_name TEXT        NOT NULL DEFAULT 'Anonymous',
  content     TEXT        NOT NULL,
  reactions   JSONB       DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Star ratings ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ratings (
  id          SERIAL      PRIMARY KEY,
  game_id     TEXT        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  rating      INTEGER     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Collections ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS collections (
  id          SERIAL      PRIMARY KEY,
  name        TEXT        NOT NULL,
  description TEXT,
  game_ids    TEXT[]      DEFAULT '{}',
  is_staff_pick BOOLEAN   DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Reports ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL      PRIMARY KEY,
  game_id     TEXT        NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  reason      TEXT        NOT NULL,
  status      TEXT        DEFAULT 'pending',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_games_author     ON games(author);
CREATE INDEX IF NOT EXISTS idx_games_featured   ON games(featured);
CREATE INDEX IF NOT EXISTS idx_games_trending   ON games(is_trending);
CREATE INDEX IF NOT EXISTS idx_games_category   ON games(category);
CREATE INDEX IF NOT EXISTS idx_comments_game_id ON comments(game_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent  ON comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_ratings_game_id  ON ratings(game_id);

-- ── Migrations (safe to run on existing DBs) ─────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'games' AND column_name = 'featured'
  ) THEN
    ALTER TABLE games ADD COLUMN featured BOOLEAN DEFAULT false;
  END IF;
END $$;
