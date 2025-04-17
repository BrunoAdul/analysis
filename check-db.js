const mysql = require('mysql2/promise');
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

    // Check users table structure
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM users');
      console.log('Users table columns:');
      columns.forEach(col => {
        console.log(`- ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.error('Error checking users table structure:', error.message);
    }

    // Try to alter the table to add missing columns
    try {
      console.log('\nAttempting to add missing columns to users table...');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255) NOT NULL');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT "user"');
      console.log('Table structure updated successfully');
    } catch (error) {
      console.error('Error updating table structure:', error.message);
    }

    // Check users table structure again
    try {
      const [columns] = await pool.query('SHOW COLUMNS FROM users');
      console.log('\nUpdated users table columns:');
      columns.forEach(col => {
        console.log(`- ${col.Field} (${col.Type})`);
      });
    } catch (error) {
      console.error('Error checking updated users table structure:', error.message);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

main();