const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function createAdmin() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  try {
    // Create admin user with correct email format
    const adminEmail = '99-99999@g.batstate-u.edu.ph';
    const adminPassword = '99-99999'; // Default password is the student ID
    
    // Check if admin already exists
    const [existing] = await pool.query('SELECT * FROM students WHERE email = ?', [adminEmail]);
    
    if (existing.length > 0) {
      // Update existing user to admin role and set password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query('UPDATE students SET role = ?, password = ? WHERE email = ?', ['admin', hashedPassword, adminEmail]);
      console.log('✅ Admin user updated successfully!');
    } else {
      // Create new admin user with password
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await pool.query('INSERT INTO students (email, password, role) VALUES (?, ?, ?)', [adminEmail, hashedPassword, 'admin']);
      console.log('✅ Admin user created successfully!');
    }

    console.log('📧 Admin Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('🔑 Role: admin');
    console.log('🚀 You can now login with this email and password to access admin features!');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin(); 