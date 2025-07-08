const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function updateExistingPasswords() {
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
    // Get all existing users
    const [users] = await pool.query('SELECT id, email FROM students');
    
    if (users.length === 0) {
      console.log('No users found in database');
      return;
    }

    console.log(`Found ${users.length} users to update`);
    
    for (const user of users) {
      // Extract student ID from email (e.g., "22-00869" from "22-00869@g.batstate-u.edu.ph")
      const studentId = user.email.split('@')[0];
      const hashedPassword = await bcrypt.hash(studentId, 10);
      
      await pool.query('UPDATE students SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      console.log(`✅ Updated password for ${user.email}: ${studentId}`);
    }

    console.log('\n🎉 All user passwords updated successfully!');
    console.log('📝 Default passwords are set to the student ID (e.g., "22-00869")');
    console.log('🔐 Users can now login with their email and student ID as password');

  } catch (error) {
    console.error('❌ Error updating passwords:', error.message);
  } finally {
    await pool.end();
  }
}

updateExistingPasswords(); 