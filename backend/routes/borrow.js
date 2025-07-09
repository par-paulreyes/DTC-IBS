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
    // Prevent duplicate borrow requests
    const [existing] = await pool.query(
      'SELECT * FROM borrow_requests WHERE user_id = ? AND status IN (?, ?, ?) AND pickup_date = ? AND return_date = ? AND item_ids = ?',
      [req.user.id, 'To be Borrowed', 'approved', 'borrowed', pickup_date, return_date, JSON.stringify(item_ids)]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Duplicate borrow request detected.' });
    }
    // Set status to 'To be Borrowed' for the request
    const [result] = await pool.query(
      'INSERT INTO borrow_requests (user_id, item_ids, status, pickup_date, return_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, JSON.stringify(item_ids), 'To be Borrowed', pickup_date, return_date]
    );
    // Update each item's item_status to 'To be Borrowed'
    for (const itemId of item_ids) {
      await pool.query('UPDATE items SET item_status = ? WHERE id = ?', ['To be Borrowed', itemId]);
    }
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cancel pending request
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      // Admin: hard delete any borrow request
      await pool.query('DELETE FROM borrow_requests WHERE id = ?', [req.params.id]);
      return res.json({ success: true });
    }
    // User: only cancel their own 'To be Borrowed' requests
    const [[request]] = await pool.query('SELECT item_ids FROM borrow_requests WHERE id = ? AND user_id = ? AND status = ?', [req.params.id, req.user.id, 'To be Borrowed']);
    if (!request) return res.status(404).json({ error: 'Not found or not To be Borrowed' });
    const itemIds = JSON.parse(request.item_ids);
    const [result] = await pool.query(
      'UPDATE borrow_requests SET status = ? WHERE id = ? AND user_id = ? AND status = ?',
      ['cancelled', req.params.id, req.user.id, 'To be Borrowed']
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found or not To be Borrowed' });
    for (const itemId of itemIds) {
      await pool.query('UPDATE items SET item_status = ? WHERE id = ?', ['Available', itemId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 