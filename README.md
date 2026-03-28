# WebGames

A community platform for uploading, sharing, and playing browser-based games built with AI tools.

![WebGames Screenshot](https://via.placeholder.com/900x450.png?text=WebGames+Screenshot)

---

## Features

### Phase 1 — Core Platform
- Upload HTML/ZIP games with title, description, author, and tags
- Browse all games on the home page
- Play games in a dedicated game page
- REST API (Express) backed by Supabase PostgreSQL

### Phase 2 — Discovery
- Like games (persistent, per-session)
- Filter games by tag
- Sort by newest, most played, or most liked

### Phase 3 — Community
- Comment on games (name + message)
- Creator profile pages (all games by one author)
- Leaderboard (top games by play count / likes)
- Social sharing (copy link / open graph)
- Fullscreen play mode

### Phase 4 — Cloud Infrastructure
- PostgreSQL database via Supabase
- Game files and thumbnails stored in Supabase Storage
- Vercel deployment (frontend + backend as separate projects)

### Phase 5 — Admin & Polish
- Admin panel to delete games
- Thumbnail image upload per game
- Support for ZIP games (multi-file HTML projects)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TailwindCSS |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL via `pg` driver) |
| File Storage | Supabase Storage (bucket: `games`) |
| Deployment | Vercel (frontend + backend as separate projects) |

---

## Project Structure

```
WebGames/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Home, Game, Upload, Creator, Leaderboard, Admin
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json          # SPA rewrites for Vercel
│   └── vite.config.js
├── server/                  # Express backend
│   ├── api/
│   │   └── index.js         # Vercel serverless entry point
│   ├── routes/
│   │   ├── games.js
│   │   ├── creators.js
│   │   └── admin.js
│   ├── app.js               # Express app (no listen — shared entry)
│   ├── db.js                # Supabase PostgreSQL pool
│   ├── storage.js           # Supabase Storage helpers
│   ├── index.js             # Local dev server
│   └── vercel.json
├── supabase/
│   └── schema.sql           # Database schema
├── .env.example
└── package.json             # Root scripts (concurrently)
```

---

## Local Development

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### 1. Clone and install dependencies

```bash
git clone https://github.com/amithey/WebGames.git
cd WebGames
npm install
cd client && npm install
cd ../server && npm install
```

### 2. Set up environment variables

```bash
# Copy the example file into server/
cp .env.example server/.env
```

Then edit `server/.env` and fill in:

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
DATABASE_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
FRONTEND_URL=http://localhost:5173
```

For the frontend, `VITE_API_URL` can be left empty in development — Vite's proxy forwards `/api` to `localhost:3001`.

### 3. Set up Supabase (one-time)

**A. Create the database tables**
1. Go to Supabase Dashboard → SQL Editor → New query
2. Paste and run the contents of [`supabase/schema.sql`](./supabase/schema.sql)

**B. Create the Storage bucket**
1. Go to Supabase Dashboard → Storage → New bucket
2. Name it exactly: `games`
3. Enable **Public bucket**

### 4. Run

```bash
# From the WebGames/ root
npm run dev
# → Frontend: http://localhost:5173
# → Backend:  http://localhost:3001
```

---

## Production Deployment (Vercel)

Both the frontend and backend are deployed as **separate Vercel projects** from the same GitHub repo.

### Deploy the Backend

1. Vercel → Add New Project → import this repo
2. Set **Root Directory** to `server/`
3. Leave Build Command and Output Directory empty
4. Add environment variables:

| Variable | Value |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Your Supabase anon key |
| `DATABASE_URL` | Your Supabase PostgreSQL URI |
| `FRONTEND_URL` | Your frontend Vercel URL (add after frontend deploy) |

### Deploy the Frontend

1. Vercel → Add New Project → import the same repo
2. Set **Root Directory** to `client/`
3. Build Command: `npm run build` | Output Directory: `dist`
4. Add environment variable:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your backend Vercel URL |

### Wire CORS
After both are deployed, go back to the **backend** project in Vercel and set `FRONTEND_URL` to the frontend URL, then redeploy.

---

## Environment Variables Reference

| Variable | Used In | Description |
|---|---|---|
| `SUPABASE_URL` | Backend | Supabase project URL |
| `SUPABASE_ANON_KEY` | Backend | Supabase public anon key |
| `DATABASE_URL` | Backend | PostgreSQL connection string |
| `FRONTEND_URL` | Backend | Allowed CORS origin |
| `VITE_API_URL` | Frontend | Backend base URL (empty = dev proxy) |

---

## Known Limitations

| Limitation | Detail |
|---|---|
| **File size** | Vercel Serverless body limit ~4.5 MB — keep game files under 4 MB |
| **Timeout** | Vercel Hobby tier: 10 s per function invocation |
| **Cold starts** | First request after inactivity may take 1–2 s |
