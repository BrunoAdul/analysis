const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('Excel Flow Analyzer - Database Connection Test');
  console.log('=============================================');
  console.log();
  
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'excel_flow_analyzer',
  };
  
  console.log('Database configuration:');
  console.log(`- Host: ${dbConfig.host}`);
  console.log(`- User: ${dbConfig.user}`);
  console.log(`- Database: ${dbConfig.database}`);
  console.log();
  
  try {
    console.log('Attempting to connect to MySQL...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('Connection successful!');
    
    console.log('Checking if database exists...');
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbConfig.database}'`);
    
    if (rows.length === 0) {
      console.log(`Database '${dbConfig.database}' does not exist.`);
      console.log('Please run the init-db.bat script to create the database.');
    } else {
      console.log(`Database '${dbConfig.database}' exists.`);
      
      console.log('Checking if tables exist...');
      await connection.query(`USE ${dbConfig.database}`);
      const [tables] = await connection.query('SHOW TABLES');
      
      if (tables.length === 0) {
        console.log('No tables found in the database.');
        console.log('Please run the init-db.bat script to create the tables.');
      } else {
        console.log(`Found ${tables.length} tables:`);
        tables.forEach(table => {
          const tableName = Object.values(table)[0];
          console.log(`- ${tableName}`);
        });
        
        // Check if sales_items table exists and has data
        const salesItemsTable = tables.find(table => Object.values(table)[0] === 'sales_items');
        if (salesItemsTable) {
          const [count] = await connection.query('SELECT COUNT(*) as count FROM sales_items');
          console.log(`The sales_items table has ${count[0].count} records.`);
        }
      }
    }
    
    await connection.end();
  } catch (error) {
    console.error('Error connecting to MySQL:');
    console.error(error.message);
    console.error();
    console.error('Possible solutions:');
    console.error('1. Make sure MySQL is installed and running');
    console.error('2. Check your MySQL credentials in the .env file');
    console.error('3. Run the init-db.bat script to initialize the database');
    console.error();
    console.error('Full error details:');
    console.error(error);
  }
}

testConnection();