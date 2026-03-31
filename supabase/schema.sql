-- ============================================================
-- WebGames — Supabase PostgreSQL Schema
-- ============================================================

-- ── Profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT        UNIQUE NOT NULL,
  is_admin    BOOLEAN     DEFAULT false,
  avatar_url  TEXT,
  bio         TEXT        DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Core games table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
  id           TEXT        PRIMARY KEY,
  user_id      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
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

-- ── Migrations ───────────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'games' AND column_name = 'user_id') THEN
    ALTER TABLE games ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;
END $$;


-- -- Triggers ---------------------------------------------------

-- Function to create a profile for a new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

