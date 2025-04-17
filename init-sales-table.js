const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function initializeDatabase() {
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

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'create-sales-table.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute SQL script
    console.log('Executing SQL script...');
    await connection.query(sqlScript);
    console.log('SQL script executed successfully');

    // Close connection
    await connection.end();
    console.log('Database connection closed');
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();