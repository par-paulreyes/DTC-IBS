const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email } = req.body;
  
  // Updated email validation for format: XX-XXXXX@g.batstate-u.edu.ph
  const emailPattern = /^\d{2}-\d{5}@g\.batstate-u\.edu\.ph$/;
  
  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: 'Invalid email format. Must be XX-XXXXX@g.batstate-u.edu.ph' });
  }
  
  try {
    // Find or create user
    let [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    let user;
    if (rows.length === 0) {
      // Default role: user
      const [result] = await pool.query('INSERT INTO students (email, role) VALUES (?, ?)', [email, 'user']);
      user = { id: result.insertId, email, role: 'user' };
    } else {
      user = rows[0];
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 