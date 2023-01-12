-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS excel_flow_analyzer;

-- Use the database
USE excel_flow_analyzer;

-- Create sales_items table
CREATE TABLE IF NOT EXISTS sales_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  buying_price DECIMAL(10, 2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create users table for future authentication
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'user') NOT NULL DEFAULT 'user',
  avatar_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create an index on date for faster filtering
CREATE INDEX idx_sales_items_date ON sales_items(date);

-- Create an index on item_name for faster grouping in reports
CREATE INDEX idx_sales_items_item_name ON sales_items(item_name);
