const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const router = express.Router();

// Optional email notification function
const sendLoginNotification = async (userEmail, userAgent, ipAddress) => {
  try {
    // Only try to send email if nodemailer is available and email config exists
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_TO) {
      const nodemailer = require('nodemailer');
      
      const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: process.env.EMAIL_TO,
        subject: 'New Login to DTC-IBS System',
        html: `
          <h2>New Login Detected</h2>
          <p><strong>User Email:</strong> ${userEmail}</p>
          <p><strong>Login Time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>IP Address:</strong> ${ipAddress || 'Unknown'}</p>
          <p><strong>User Agent:</strong> ${userAgent || 'Unknown'}</p>
          <hr>
          <p><em>This is an automated notification from the DTC-IBS system.</em></p>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('Login notification email sent successfully');
    } else {
      console.log('Email configuration not set up. Skipping login notification.');
    }
  } catch (error) {
    console.error('Failed to send login notification email:', error);
    // Don't throw error to avoid breaking the login process
  }
};

// Signup route with email verification
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || password.length < 6) {
    return res.status(400).json({ error: 'Email and password (min 6 chars) are required.' });
  }
  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create user with verified = FALSE
    const [result] = await pool.query(
      'INSERT INTO students (email, password, role, verified, created_at) VALUES (?, ?, ?, ?, NOW())',
      [email, hashedPassword, 'user', false]
    );
    const studentId = result.insertId;
    // Generate verification token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await pool.query(
      'INSERT INTO verification_tokens (student_id, token, expires_at) VALUES (?, ?, ?)',
      [studentId, token, expiresAt]
    );
    // Send verification email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email for DTC-IBS',
      html: `<h2>Email Verification</h2><p>Click the link below to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link will expire in 24 hours.</p>`
    });
    res.json({ message: 'Signup successful! Please check your email to verify your account.' });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'An error occurred during signup.' });
  }
});

// Email verification route
router.get('/verify', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Verification token required.' });
  try {
    const [rows] = await pool.query('SELECT * FROM verification_tokens WHERE token = ?', [token]);
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired verification token.' });
    }
    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Verification token has expired.' });
    }
    // Set verified = TRUE for the user
    await pool.query('UPDATE students SET verified = TRUE WHERE id = ?', [record.student_id]);
    // Delete the token
    await pool.query('DELETE FROM verification_tokens WHERE id = ?', [record.id]);
    res.json({ message: 'Email verified! You can now log in.' });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ error: 'An error occurred during verification.' });
  }
});

// Update login route to require verified = TRUE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  if (!email || !emailPattern.test(email)) {
    return res.status(400).json({ error: 'Invalid email format.' });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  try {
    let [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    let user = rows[0];

    // If user does not exist, create them and send verification email
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        'INSERT INTO students (email, password, role, verified, created_at) VALUES (?, ?, ?, ?, NOW())',
        [email, hashedPassword, 'user', false]
      );
      const userId = result.insertId;

      // Generate verification token
      const token = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await pool.query(
        'INSERT INTO verification_tokens (student_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );

      // Send verification email
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`;
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email for DTC-IBS',
        html: `<h2>Email Verification</h2><p>Click the link below to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link will expire in 24 hours.</p>`
      });

      return res.status(403).json({ error: 'Please verify your email before logging in. A verification email has been sent.' });
    }

    // If user exists, check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // If not verified, send verification email
    if (!user.verified) {
      // Generate a new verification token
      const token = require('crypto').randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await pool.query('DELETE FROM verification_tokens WHERE student_id = ?', [user.id]);
      await pool.query(
        'INSERT INTO verification_tokens (student_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );
      // Send verification email
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`;
      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email for DTC-IBS',
        html: `<h2>Email Verification</h2><p>Click the link below to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link will expire in 24 hours.</p>`
      });
      return res.status(403).json({ error: 'Please verify your email before logging in. A verification email has been sent.' });
    }

    // If verified and password is correct, log in
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    const userAgent = req.get('User-Agent');
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    sendLoginNotification(user.email, userAgent, ipAddress).catch(err => {
      console.error('Failed to send login notification:', err);
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  }
});

// Add a route to change password
router.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    // Get user with current password
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [decoded.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE students SET password = ? WHERE id = ?', [hashedNewPassword, decoded.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ 
      error: 'An error occurred while changing password' 
    });
  }
});

// Resend verification email route
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required.' });
  try {
    const [rows] = await pool.query('SELECT * FROM students WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with that email.' });
    }
    const user = rows[0];
    if (user.verified) {
      return res.status(400).json({ error: 'Account is already verified.' });
    }
    // Generate a new verification token
    const token = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    // Remove any previous tokens for this user
    await pool.query('DELETE FROM verification_tokens WHERE student_id = ?', [user.id]);
    await pool.query(
      'INSERT INTO verification_tokens (student_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );
    // Send verification email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify?token=${token}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Verify your email for DTC-IBS',
      html: `<h2>Email Verification</h2><p>Click the link below to verify your email:</p><a href="${verifyUrl}">${verifyUrl}</a><p>This link will expire in 24 hours.</p>`
    });
    res.json({ message: 'A new verification email has been sent.' });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'An error occurred while resending verification email.' });
  }
});

module.exports = router; 