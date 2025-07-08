const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function addSampleData() {
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
    // Add sample users with correct email format
    const users = [
      { email: '22-00869@g.batstate-u.edu.ph', role: 'user' },
      { email: '22-00870@g.batstate-u.edu.ph', role: 'user' },
      { email: '22-00871@g.batstate-u.edu.ph', role: 'user' }
    ];

    for (const user of users) {
      try {
        // Extract student ID for password
        const studentId = user.email.split('@')[0];
        const hashedPassword = await bcrypt.hash(studentId, 10);
        await pool.query('INSERT INTO students (email, password, role) VALUES (?, ?, ?)', [user.email, hashedPassword, user.role]);
        console.log(`✅ User created: ${user.email} (password: ${studentId})`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  User already exists: ${user.email}`);
        } else {
          console.error(`❌ Error creating user ${user.email}:`, error.message);
        }
      }
    }

    // Add sample items
    const items = [
      {
        property_no: 'LAP001',
        qr_code: 'LAP001_QR',
        article_type: 'Laptop',
        specifications: 'Dell Latitude 5520, Intel i7, 16GB RAM, 512GB SSD',
        location: 'Room 101',
        company_name: 'Dell Inc.',
        price: 45000.00
      },
      {
        property_no: 'PROJ001',
        qr_code: 'PROJ001_QR',
        article_type: 'Projector',
        specifications: 'Epson EB-X41, 4100 Lumens, HD Ready',
        location: 'Room 102',
        company_name: 'Epson',
        price: 35000.00
      },
      {
        property_no: 'TAB001',
        qr_code: 'TAB001_QR',
        article_type: 'Tablet',
        specifications: 'iPad Pro 12.9", 256GB, WiFi + Cellular',
        location: 'Room 103',
        company_name: 'Apple Inc.',
        price: 65000.00
      },
      {
        property_no: 'CAM001',
        qr_code: 'CAM001_QR',
        article_type: 'Camera',
        specifications: 'Canon EOS R6, 20.1MP, 4K Video',
        location: 'Room 104',
        company_name: 'Canon',
        price: 85000.00
      },
      {
        property_no: 'MIC001',
        qr_code: 'MIC001_QR',
        article_type: 'Microphone',
        specifications: 'Shure SM58, Dynamic Microphone',
        location: 'Room 105',
        company_name: 'Shure',
        price: 8000.00
      }
    ];

    for (const item of items) {
      try {
        await pool.query(`
          INSERT INTO items (property_no, qr_code, article_type, specifications, location, company_name, price, date_acquired, item_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, CURDATE(), ?)
        `, [item.property_no, item.qr_code, item.article_type, item.specifications, item.location, item.company_name, item.price, 'Available']);
        console.log(`✅ Item created: ${item.article_type} (${item.property_no})`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Item already exists: ${item.article_type} (${item.property_no})`);
        } else {
          console.error(`❌ Error creating item ${item.article_type}:`, error.message);
        }
      }
    }

    // Add sample borrow requests
    const requests = [
      {
        user_email: '22-00869@g.batstate-u.edu.ph',
        item_ids: [1],
        status: 'To be Borrowed',
        pickup_date: '2024-07-10',
        return_date: '2024-07-15'
      },
      {
        user_email: '22-00870@g.batstate-u.edu.ph',
        item_ids: [2],
        status: 'approved',
        pickup_date: '2024-07-12',
        return_date: '2024-07-18'
      },
      {
        user_email: '22-00871@g.batstate-u.edu.ph',
        item_ids: [3],
        status: 'borrowed',
        pickup_date: '2024-07-08',
        return_date: '2024-07-14'
      }
    ];

    for (const request of requests) {
      try {
        // Get user ID
        const [users] = await pool.query('SELECT id FROM students WHERE email = ?', [request.user_email]);
        if (users.length > 0) {
          await pool.query(`
            INSERT INTO borrow_requests (user_id, item_ids, status, pickup_date, return_date)
            VALUES (?, ?, ?, ?, ?)
          `, [users[0].id, JSON.stringify(request.item_ids), request.status, request.pickup_date, request.return_date]);
          console.log(`✅ Request created for ${request.user_email} - Status: ${request.status}`);
        }
      } catch (error) {
        console.error(`❌ Error creating request for ${request.user_email}:`, error.message);
      }
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('📊 You can now test the admin dashboard with real data.');

  } catch (error) {
    console.error('❌ Error adding sample data:', error.message);
  } finally {
    await pool.end();
  }
}

addSampleData(); 