use ims_db;

select * from students;

INSERT INTO students (email, password, role, created_at)
VALUES
('22-00869@g.batstate-u.edu.ph', '$2a$10$wH8QwQwQwQwQwQwQwQwQOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'user', NOW()),
('22-12345@g.batstate-u.edu.ph', '$2a$10$wH8QwQwQwQwQwQwQwQwQOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'admin', NOW()),
('student1@sr-code@g.batstate-u.edu.ph', '$2a$10$wH8QwQwQwQwQwQwQwQwQOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'user', NOW()),
('student2@sr-code@g.batstate-u.edu.ph', '$2a$10$wH8QwQwQwQwQwQwQwQwQOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'user', NOW()),
('student3@sr-code@g.batstate-u.edu.ph', '$2a$10$wH8QwQwQwQwQwQwQwQwQOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'user', NOW()),
('22-06939@g.batstate-u.edu.ph', '$2a$10$wH8QwQwQwQwQwQwQwQwQOeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'user', NOW());

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
    serial_no VARCHAR(100) DEFAULT NULL,
    brand VARCHAR(100) DEFAULT NULL,
    category ENUM('Electronic', 'Utility', 'Tool', 'Supply') DEFAULT NULL,
    quantity INT DEFAULT 1,
    item_status ENUM('Available', 'Bad Condition', 'To be Borrowed', 'Borrowed') DEFAULT 'Available',
    remarks TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);