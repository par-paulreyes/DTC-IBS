const pool = require('../config/db');

async function viewDatabase() {
  try {
    console.log('=== Database Connection Test ===');
    
    // Test connection
    const [testResult] = await pool.query('SELECT 1 as test');
    console.log('✅ Database connection successful');
    
    // Show database info
    const [dbInfo] = await pool.query('SELECT DATABASE() as current_db');
    console.log(`📊 Current database: ${dbInfo[0].current_db}`);
    
    // Show all tables
    console.log('\n=== Available Tables ===');
    const [tables] = await pool.query('SHOW TABLES');
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`📋 ${tableName}`);
    });
    
    // Show students table structure
    console.log('\n=== Students Table Structure ===');
    const [columns] = await pool.query('DESCRIBE students');
    console.table(columns);
    
    // Show all students
    console.log('\n=== All Students ===');
    const [students] = await pool.query('SELECT id, email, role, created_at, updated_at FROM students');
    console.table(students);
    
    // Show count of students with/without passwords
    console.log('\n=== Password Status ===');
    const [passwordStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN password IS NOT NULL THEN 1 END) as users_with_password,
        COUNT(CASE WHEN password IS NULL THEN 1 END) as users_without_password
      FROM students
    `);
    console.table(passwordStats);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database error:', error.message);
    process.exit(1);
  }
}

viewDatabase(); 