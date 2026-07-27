-- Users table
-- This table stores employee login details and their roles.
CREATE TABLE users (
    employee_id VARCHAR(20) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL
);

-- Sample user data
INSERT INTO users (employee_id, password, role)
VALUES
('QE1001', 'password123', 'quality_engineer'),
('QE1002', 'password123', 'quality_engineer'),
('QE1003', 'password123', 'quality_engineer'),
('FS1001', 'password123', 'factory_supervisor'),
('FS1002', 'password123', 'factory_supervisor'),
('FS1003', 'password123', 'factory_supervisor');

-- View users table
SELECT * FROM users;


-- Products table
-- This table stores the product details.
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL
);

-- Sample product data
INSERT INTO products (product_name, category)
VALUES
('Bottle', 'MVTec AD'),
('Cable', 'MVTec AD'),
('Capsule', 'MVTec AD'),
('Hazelnut', 'MVTec AD'),
('Metal Nut', 'MVTec AD');

-- Inspections table
-- This table stores inspection records.
CREATE TABLE inspections (
    inspection_id SERIAL PRIMARY KEY,
    employee_id VARCHAR(20) NOT NULL,
    product_id INT NOT NULL,
    image_name VARCHAR(255) NOT NULL,

    -- Connects inspection with user
    FOREIGN KEY (employee_id) REFERENCES users(employee_id),

    -- Connects inspection with product
    FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Sample inspection data
INSERT INTO inspections (employee_id, product_id, image_name)
VALUES
('QE1001', 1, 'bottle_001.png'),
('QE1002', 2, 'cable_001.png'),
('QE1003', 3, 'capsule_001.png'),
('QE1001', 4, 'hazelnut_001.png'),
('QE1002', 5, 'metalnut_001.png');

-- View all tables
SELECT * FROM users;
SELECT * FROM products;
SELECT * FROM inspections;