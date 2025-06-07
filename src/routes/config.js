// src/routes/config.js
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

// adjust this path if your config lives elsewhere
const CONFIG_PATH = path.join(__dirname, '../config/grow-config.json');

router.get('/', async (req, res, next) => {
  try {
    const body = await fs.readFile(CONFIG_PATH, 'utf8');
    res.json(JSON.parse(body));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const updated = JSON.stringify(req.body, null, 2);
    await fs.writeFile(CONFIG_PATH, updated, 'utf8');
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
