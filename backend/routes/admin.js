const express = require('express');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const router = express.Router();

function adminMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Pending for approval
router.get('/pending', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, s.email as user_email 
      FROM borrow_requests br 
      JOIN students s ON br.user_id = s.id 
      WHERE br.status = 'pending'
      ORDER BY br.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approved
router.get('/approved', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, s.email as user_email 
      FROM borrow_requests br 
      JOIN students s ON br.user_id = s.id 
      WHERE br.status = 'approved'
      ORDER BY br.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Borrowed
router.get('/borrowed', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, s.email as user_email 
      FROM borrow_requests br 
      JOIN students s ON br.user_id = s.id 
      WHERE br.status = 'borrowed'
      ORDER BY br.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve request
router.put('/approve/:id', adminMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE borrow_requests SET status = ? WHERE id = ? AND status = ?',
      ['approved', req.params.id, 'pending']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not pending' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decline request
router.put('/decline/:id', adminMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE borrow_requests SET status = ? WHERE id = ? AND status = ?',
      ['declined', req.params.id, 'pending']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not pending' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scan to borrow (mark as borrowed)
router.put('/scan-borrow/:id', adminMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE borrow_requests SET status = ? WHERE id = ? AND status = ?',
      ['borrowed', req.params.id, 'approved']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not approved' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scan to return (mark as returned)
router.put('/scan-return/:id', adminMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE borrow_requests SET status = ? WHERE id = ? AND status = ?',
      ['returned', req.params.id, 'borrowed']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not borrowed' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 