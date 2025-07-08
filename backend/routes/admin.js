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
      WHERE br.status = 'To be Borrowed'
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
    // Update status to approved (no checklist needed)
    const [result] = await pool.query(
      'UPDATE borrow_requests SET status = ? WHERE id = ? AND status = ?',
      ['approved', req.params.id, 'To be Borrowed']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not To be Borrowed' });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Decline request
router.put('/decline/:id', adminMiddleware, async (req, res) => {
  try {
    // First, get the item_ids for the request
    const [[request]] = await pool.query('SELECT item_ids FROM borrow_requests WHERE id = ? AND status = ?', [req.params.id, 'To be Borrowed']);
    if (!request) {
      return res.status(404).json({ error: 'Request not found or not To be Borrowed' });
    }
    const itemIds = JSON.parse(request.item_ids);
    // Update the borrow request status
    const [result] = await pool.query(
      'UPDATE borrow_requests SET status = ? WHERE id = ? AND status = ?',
      ['declined', req.params.id, 'To be Borrowed']
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found or not To be Borrowed' });
    }
    // Update all items in the request to Available
    for (const itemId of itemIds) {
      await pool.query('UPDATE items SET item_status = ? WHERE id = ?', ['Available', itemId]);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Scan to borrow (mark as borrowed)
router.put('/scan-borrow/:id', adminMiddleware, async (req, res) => {
  try {
    // Expect checklist with remarks in body (no condition updates)
    const { checklist } = req.body; // [{itemId, condition, remarks}]
    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: 'Checklist required' });
    }
    // Update item_status to 'Borrowed' and remarks for each item
    for (const entry of checklist) {
      await pool.query('UPDATE items SET item_status = ?, remarks = ? WHERE id = ?', ['Borrowed', entry.remarks, entry.itemId]);
    }
    // Update request status to borrowed
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
    // Expect checklist and remarks in body
    const { checklist } = req.body; // [{itemId, condition, remarks}]
    if (!Array.isArray(checklist)) {
      return res.status(400).json({ error: 'Checklist required' });
    }
    // Update each item's item_status based on condition and update remarks
    for (const entry of checklist) {
      const status = entry.condition === 'Bad' ? 'Bad Condition' : 'Available';
      await pool.query('UPDATE items SET item_status = ?, remarks = ? WHERE id = ?', [status, entry.remarks, entry.itemId]);
    }
    // Update request status
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

// All logs
router.get('/logs', adminMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT br.*, s.email as user_email 
      FROM borrow_requests br 
      JOIN students s ON br.user_id = s.id 
      ORDER BY br.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Edit a log (borrow request)
router.put('/logs/:id', adminMiddleware, async (req, res) => {
  try {
    const { status, pickup_date, return_date, remarks } = req.body;
    const fields = [];
    const values = [];
    if (status) { fields.push('status = ?'); values.push(status); }
    if (pickup_date) { fields.push('pickup_date = ?'); values.push(pickup_date); }
    if (return_date) { fields.push('return_date = ?'); values.push(return_date); }
    if (remarks) { fields.push('remarks = ?'); values.push(remarks); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE borrow_requests SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Log not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 