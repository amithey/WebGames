# 🎮 WebGames

A modern, high-performance community platform for uploading, sharing, and playing browser-based games. Built with a focus on speed, security, and developer experience.

![WebGames Screenshot](https://via.placeholder.com/1200x600.png?text=WebGames+Platform+Preview)

---

## 🛡️ Security Hardening

The project has recently undergone a comprehensive security audit and hardening process to ensure a safe environment for both creators and players:

- **JWT Authentication**: Secure admin dashboard access using **JSON Web Tokens**. Features include timing-safe password comparisons to prevent brute-force and timing attacks.
- **Layered Rate Limiting**: Protection against DDoS and abuse using `express-rate-limit` with specialized tiers:
  - **General API**: 200 requests per 15 minutes.
  - **Admin Login**: 10 attempts per 15 minutes (Brute-force protection).
  - **Game Uploads**: 10 uploads per hour per IP.
  - **Interactions**: 30 requests per minute for likes/ratings/comments.
- **Helmet.js Integration**: Implementation of security-focused HTTP headers, including a strict **Content Security Policy (CSP)** and Cross-Origin Resource Policy (CORP).
- **CORS Protection**: Strict origin-based access control, restricting API access to the verified frontend domain.
- **Payload Validation**: Explicit body-size limits (1MB) on JSON and URL-encoded data to prevent memory exhaustion attacks.

---

## ✨ Key Features

- **Game Discovery**: Browse, filter by tags, and sort by popularity, recency, or featured status.
- **Seamless Playback**: Games run in isolated environments for performance and security.
- **Creator Dashboard**: Dedicated space for developers to upload HTML/ZIP projects and manage their portfolio.
- **Engagement**: Community-driven features including star ratings, comments, and a global leaderboard.
- **Admin Command Center**: A secure portal for moderators to manage content, toggle "Featured" status, and monitor platform-wide analytics.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, TailwindCSS, Axios |
| **Backend** | Node.js, Express.js |
| **Security** | JWT (jsonwebtoken), Helmet, express-rate-limit, bcryptjs |
| **Database** | Supabase (PostgreSQL via `pg` pool) |
| **Storage** | Supabase Storage (Blob storage for game assets) |
| **Deployment** | Vercel (Optimized Monorepo configuration) |

---

## 📂 Project Structure

```text
WebGames/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── pages/           # Home, Game, Upload, Creator, Leaderboard, Admin
│   │   └── main.jsx         # Entry point
│   └── vercel.json          # SPA routing configuration
├── server/                  # Express backend
│   ├── middleware/          # Security & Rate limiting logic
│   ├── routes/              # Modular API endpoints (games, creators, admin)
│   ├── db.js                # Optimized PostgreSQL connection pooling
│   ├── storage.js           # Supabase Storage integration
│   └── app.js               # Express application setup
├── supabase/
│   └── schema.sql           # Database structure & migrations
└── package.json             # Root scripts for local orchestration
```

---

## 🛠️ Local Development

### 1. Installation

```bash
# Install root dependencies
npm install

# Install client and server dependencies
npm run install:all
```

### 2. Environment Setup

Create a `.env` file in the `server/` directory:

```env
# Database & API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@db.ref.supabase.co:5432/postgres

# Security
JWT_SECRET=your-long-random-secret
ADMIN_PASSWORD=your-secure-admin-password
FRONTEND_URL=http://localhost:5173
```

### 3. Database Initialization

Run the contents of `supabase/schema.sql` in the **Supabase SQL Editor** to create the necessary tables and indexes. Ensure a public storage bucket named `games` is created in the Supabase Dashboard.

### 4. Start the Engines

```bash
# Run both frontend and backend concurrently
npm run dev
```

---

## ☁️ Vercel Deployment

The project is optimized for Vercel's serverless environment.

1. **Backend**: Import the repo, set the root directory to `server/`. Add all `.env` variables listed above. Use the Supabase connection string with `?pgbouncer=true` if using Transaction mode.
2. **Frontend**: Import the same repo, set the root directory to `client/`. Add `VITE_API_URL` pointing to your backend Vercel URL.

---

## 📈 Roadmap & Limitations

- **File Limits**: Vercel Serverless Functions have a ~4.5MB payload limit. Game ZIPs should stay under 4MB.
- **Stateless Auth**: JWTs are used for admin access, ensuring the backend remains horizontally scalable.
- **Cold Starts**: Initial requests may experience a 1-2s delay due to Vercel's serverless architecture.
