const express = require('express');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const router = express.Router();

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// List user's borrow requests
router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM borrow_requests WHERE user_id = ?', [req.user.id]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create borrow request
router.post('/', authMiddleware, async (req, res) => {
  const { item_ids, pickup_date, return_date } = req.body;
  if (!Array.isArray(item_ids) || !pickup_date || !return_date) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO borrow_requests (user_id, item_ids, status, pickup_date, return_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, JSON.stringify(item_ids), 'pending', pickup_date, return_date]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel pending request
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM borrow_requests WHERE id = ? AND user_id = ? AND status = ?',
      [req.params.id, req.user.id, 'pending']
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or not pending' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 