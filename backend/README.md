# Inventory Borrowing Management System Backend

## Setup

1. Copy `.env.example` to `.env` and fill in your credentials.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the server:
   ```sh
   npm run dev
   # or
   npm start
   ```

## MySQL Schema

```
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_no VARCHAR(100) UNIQUE NOT NULL,
    qr_code VARCHAR(255) UNIQUE NOT NULL,
    article_type VARCHAR(100) NOT NULL,
    specifications TEXT,
    date_acquired DATE,
    end_user VARCHAR(100),
    price DECIMAL(10,2),
    location VARCHAR(255),
    supply_officer VARCHAR(100),
    company_name VARCHAR(255) NOT NULL,
    image_url VARCHAR(255),
    next_maintenance_date DATE,
    pending_maintenance_count INT DEFAULT 0,
    maintenance_status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE borrow_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    item_ids TEXT,
    status VARCHAR(50),
    pickup_date DATE,
    return_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES students(id)
);

CREATE TABLE borrow_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT,
    scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action VARCHAR(50),
    FOREIGN KEY (request_id) REFERENCES borrow_requests(id)
);
``` 