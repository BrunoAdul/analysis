const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
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

    // Read SQL file
    const sqlFilePath = path.join(__dirname, 'add-admin-user.sql');
    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    // Execute SQL script
    console.log('Executing SQL script to add admin user...');
    const [result] = await connection.query(sqlScript);
    
    if (result.affectedRows > 0) {
      console.log('Admin user added successfully!');
      console.log('User details:');
      console.log('- Name: Bruno Adul');
      console.log('- Email: brunoadul@gmail.com');
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