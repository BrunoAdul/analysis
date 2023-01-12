-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS excel_flow_analyzer;

-- Create user with no password
CREATE USER IF NOT EXISTS 'dbuser'@'localhost' IDENTIFIED WITH mysql_native_password BY '';

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON excel_flow_analyzer.* TO 'dbuser'@'localhost';

-- Flush privileges to apply changes
FLUSH PRIVILEGES;