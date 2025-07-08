const pool = require('../config/db');
const bcrypt = require('bcryptjs');

async function updateSchema() {
  try {
    console.log('Updating database schema...');

    // Check if password column exists
    const [columns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'password'
    `);

    if (columns.length === 0) {
      // Add password column
      await pool.query(`
        ALTER TABLE students 
        ADD COLUMN password VARCHAR(255) NULL
      `);
      console.log('Added password column to students table');
    } else {
      console.log('Password column already exists');
    }

    // Check if created_at column exists
    const [createdAtColumns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'created_at'
    `);

    if (createdAtColumns.length === 0) {
      // Add created_at column
      await pool.query(`
        ALTER TABLE students 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);
      console.log('Added created_at column to students table');
    } else {
      console.log('created_at column already exists');
    }

    // Check if updated_at column exists
    const [updatedAtColumns] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'students' 
      AND COLUMN_NAME = 'updated_at'
    `);

    if (updatedAtColumns.length === 0) {
      // Add updated_at column
      await pool.query(`
        ALTER TABLE students 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      `);
      console.log('Added updated_at column to students table');
    } else {
      console.log('updated_at column already exists');
    }

    console.log('Database schema updated successfully!');

    // Set default password for existing users (optional)
    const [existingUsers] = await pool.query('SELECT id, email FROM students WHERE password IS NULL');
    
    if (existingUsers.length > 0) {
      console.log(`Found ${existingUsers.length} users without passwords. Setting default password...`);
      
      const defaultPassword = 'changeme123'; // Users should change this on first login
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      
      for (const user of existingUsers) {
        await pool.query('UPDATE students SET password = ? WHERE id = ?', [hashedPassword, user.id]);
        console.log(`Set default password for user: ${user.email}`);
      }
      
      console.log('Default passwords set. Users should change their passwords on first login.');
    }

    console.log('Schema update completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema(); 