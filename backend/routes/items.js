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

// Get multiple item details by IDs
router.post('/details', async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No item IDs provided' });
  }
  try {
    // Filter out any invalid IDs and ensure they are numbers
    const validIds = ids.filter(id => id && !isNaN(Number(id))).map(id => Number(id));
    
    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid item IDs provided' });
    }
    
    const placeholders = validIds.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT id, property_no, article_type, item_status, remarks, qr_code, location FROM items WHERE id IN (${placeholders})`,
      validIds
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching item details:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 