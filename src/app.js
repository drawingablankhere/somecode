// src/app.js
const express = require('express');
const path = require('path');
const configRouter = require('./routes/config');

const app = express();

// parse JSON bodies
app.use(express.json());

// serve your existing JS/CSS if any:
// app.use('/js', express.static(path.join(__dirname, '../public/js')));
// app.use('/css', express.static(path.join(__dirname, '../public/css')));

// 1) serve the Settings UI
app.use('/settings', express.static(path.join(__dirname, '../public/settings')));

// 2) mount the config API
app.use('/api/config', configRouter);

// catch-all 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

// start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 listening on http://localhost:${PORT}`);
  console.log(`🔧 settings UI at http://localhost:${PORT}/settings/`);
});

const path = require('path');
// serve dashboard SPA
app.use('/dashboard',
  express.static(path.join(__dirname, '../public/dashboard')));
