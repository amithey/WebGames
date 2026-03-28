require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const gamesRouter    = require('./routes/games');
const creatorsRouter = require('./routes/creators');
const adminRouter    = require('./routes/admin');

const app = express();

// CORS — allow the frontend origin (set FRONTEND_URL in production)
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL, 'http://localhost:5173']
  : '*';

app.use(cors({ origin: allowedOrigins, methods: ['GET','POST','PATCH','DELETE','OPTIONS'] }));
app.use(express.json());

// Routes
app.use('/api/games',    gamesRouter);
app.use('/api/creators', creatorsRouter);
app.use('/api/admin',    adminRouter);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
