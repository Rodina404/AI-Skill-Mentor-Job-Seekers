require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const authRoutes    = require('./routes/auth.routes');
const resumeRoutes  = require('./routes/resumes.routes');
const matchRoutes   = require('./routes/matches.routes');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', service: 'express-backend', port: process.env.PORT || 5000 })
);

// Routes
app.use('/api/auth',    authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/matches', matchRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));

module.exports = app;
