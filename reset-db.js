const mysql = require('mysql2/promise');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function main() {
  try {
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'excel_flow_analyzer',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    };
    
    console.log('Attempting to connect to MySQL with config:', {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database
    });
    
    const pool = mysql.createPool(dbConfig);
    console.log('MySQL connection pool created');

    // Execute SQL statements separately
    console.log('Dropping existing users table...');
    await pool.query('DROP TABLE IF EXISTS users');
    
    console.log('Creating new users table...');
    await pool.query(`
      CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table reset successfully');

    // Verify the table structure
    const [columns] = await pool.query('SHOW COLUMNS FROM users');
    console.log('\nUsers table columns:');
    columns.forEach(col => {
      console.log(`- ${col.Field} (${col.Type})`);
    });

    console.log('\nDatabase reset completed successfully');
  } catch (error) {
    console.error('Error resetting database:', error);
  }
}

main();