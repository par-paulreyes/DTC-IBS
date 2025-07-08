const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');
const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Updated email validation for format: XX-XXXXX@g.batstate-u.edu.ph
  const emailPattern = /^\d{2}-\d{5}@g\.batstate-u\.edu\.ph$/;
  
  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: 'Invalid email format. Must be XX-XXXXX@g.batstate-u.edu.ph' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  try {
    // Find user
    let [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    let user;
    
    if (rows.length === 0) {
      // Create new user with hashed password
      const studentId = email.split('@')[0];
      const hashedPassword = await bcrypt.hash(studentId, 10);
      const [result] = await pool.query('INSERT INTO students (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, 'user']);
      user = { id: result.insertId, email, role: 'user' };
    } else {
      user = rows[0];
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }
    
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  // Email validation
  const emailPattern = /^\d{2}-\d{5}@g\.batstate-u\.edu\.ph$/;
  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: 'Invalid email format. Must be XX-XXXXX@g.batstate-u.edu.ph' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // Hash password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO students (email, password, role) VALUES (?, ?, ?)', [email, hashedPassword, 'user']);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router; 