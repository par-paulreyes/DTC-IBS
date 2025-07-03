const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM items');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 