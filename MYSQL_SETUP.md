# MySQL Integration Setup Guide

This document provides a detailed guide on how the Excel Flow Analyzer application has been configured to use MySQL for data persistence.

## Files Created/Modified

1. **Backend Server (`server.js`)**
   - Created an Express server to handle API requests
   - Implemented API endpoints for CRUD operations on sales data
   - Added MySQL connection pool for database access
   - Added file upload handling for Excel files

2. **Database Initialization (`db-init.sql`)**
   - Created SQL script to initialize the MySQL database
   - Defined schema for sales_items table
   - Added sample data for testing

3. **Environment Configuration (`.env`)**
   - Added configuration for MySQL connection
   - Added server port and other settings

4. **Package.json Updates**
   - Added MySQL-related dependencies
   - Added scripts for running the backend server
   - Added script for database initialization

5. **DataContext.tsx Updates**
   - Modified to use real API endpoints instead of localStorage
   - Added error handling with fallback to localStorage
   - Updated function signatures to reflect async nature

6. **Setup Scripts**
   - Added `setup.js` for configuring MySQL connection
   - Added `install-mysql-deps.js` for installing dependencies

## Database Schema

The main table structure is as follows:

```sql
CREATE TABLE sales_items (
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
```

## API Endpoints

The following API endpoints have been implemented:

1. **GET /api/sales**
   - Retrieves all sales data from the database
   - Returns data in JSON format

2. **POST /api/sales**
   - Adds a new sales item to the database
   - Calculates profit and revenue automatically
   - Returns the newly created item

3. **DELETE /api/sales/:id**
   - Deletes a sales item by ID
   - Returns a success message

4. **POST /api/sales/upload**
   - Uploads an Excel file with sales data
   - Parses the file and inserts data into the database
   - Returns the newly created items

5. **GET /api/sales/summary**
   - Generates a summary of sales data
   - Includes total revenue, profit, top selling items, etc.

## How to Use

1. **Install Dependencies**
   ```
   node install-mysql-deps.js
   ```

2. **Configure MySQL Connection**
   ```
   node setup.js
   ```

3. **Start the Application**
   ```
   npm run dev:full
   ```

## Fallback Mechanism

The application includes a fallback mechanism to localStorage in case the MySQL connection fails. This ensures that users can still use the application even if there are database connectivity issues.

## Future Enhancements

1. **Authentication System**
   - Add user authentication with JWT
   - Implement role-based access control

2. **Data Synchronization**
   - Add offline support with data synchronization
   - Implement queue for failed API requests

3. **Advanced Reporting**
   - Add more complex SQL queries for advanced analytics
   - Implement stored procedures for performance optimization