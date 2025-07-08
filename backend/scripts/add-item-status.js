const mysql = require('mysql2/promise');
require('dotenv').config();

async function addItemStatus() {
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
    // Add item_status column to items table
    await pool.query('ALTER TABLE items ADD COLUMN item_status VARCHAR(50) DEFAULT \'Available\'');
    console.log('✅ item_status column added to items table');

    // Update existing items to have "Available" status
    await pool.query('UPDATE items SET item_status = \'Available\' WHERE item_status IS NULL');
    console.log('✅ Updated existing items to "Available" status');

    console.log('\n🎉 Item status field added successfully!');
    console.log('📝 All items now have item_status field with default "Available" value');

  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('⚠️  item_status column already exists');
    } else {
      console.error('❌ Error adding item_status field:', error.message);
    }
  } finally {
    await pool.end();
  }
}

addItemStatus(); 