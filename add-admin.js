const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();


const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function addAdminUser() {
  // Database connection configuration
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'excel_flow_analyzer',
    multipleStatements: true // Allow multiple SQL statements
  };

  console.log('Database configuration:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
  });

  try {
    // Create connection
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL database');

    // Get admin credentials from environment variables or fallback to defaults
    const adminName = process.env.ADMIN_NAME || 'Bruno Adul';
    const adminEmail = process.env.ADMIN_EMAIL || 'brunoadul@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || '66606@Admin';

    // Hash the admin password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Insert or update admin user with hashed password
    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        password = VALUES(password),
        role = VALUES(role);
    `;

    const [result] = await connection.query(sql, [adminName, adminEmail, hashedPassword, 'admin']);
    
    if (result.affectedRows > 0) {
      console.log('Admin user added or updated successfully!');
      console.log('User details:');
      console.log('- Name:', adminName);
      console.log('- Email:', adminEmail);
      console.log('- Role: admin');
    } else {
      console.log('No rows affected. Admin user might already exist.');
    }

    // Close connection
    await connection.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error adding admin user:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('A user with this email already exists in the database.');
    }
    
    process.exit(1);
  }
}

// Run the function
addAdminUser();