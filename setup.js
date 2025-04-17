const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Excel Flow Analyzer - MySQL Setup Script');
console.log('=======================================');
console.log('This script will help you set up the MySQL database for the application.');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
let envConfig = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      envConfig[match[1].trim()] = match[2].trim();
    }
  });
}

// Install server dependencies
console.log('\nInstalling server dependencies...');
try {
  execSync('npm install cors dotenv express multer mysql2 --save', { stdio: 'inherit' });
  console.log('Server dependencies installed successfully.');
} catch (error) {
  console.error('Failed to install server dependencies:', error.message);
  process.exit(1);
}

// Prompt for MySQL configuration
const promptForConfig = () => {
  rl.question(`\nMySQL Host (default: ${envConfig.DB_HOST || 'localhost'}): `, (host) => {
    host = host || envConfig.DB_HOST || 'localhost';
    
    rl.question(`MySQL User (default: ${envConfig.DB_USER || 'root'}): `, (user) => {
      user = user || envConfig.DB_USER || 'root';
      
      rl.question('MySQL Password: ', (password) => {
        password = password || envConfig.DB_PASSWORD || '';
        
        rl.question(`Database Name (default: ${envConfig.DB_NAME || 'excel_flow_analyzer'}): `, (dbName) => {
          dbName = dbName || envConfig.DB_NAME || 'excel_flow_analyzer';
          
          // Update .env file
          const envContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=${host}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${dbName}

# JWT Secret for Authentication (for future use)
JWT_SECRET=${envConfig.JWT_SECRET || 'your_jwt_secret_here'}
JWT_EXPIRES_IN=1d`;
          
          fs.writeFileSync(envPath, envContent);
          console.log('\n.env file updated with MySQL configuration.');
          
          // Ask if user wants to initialize the database
          rl.question('\nDo you want to initialize the database now? (y/n): ', (answer) => {
            if (answer.toLowerCase() === 'y') {
              console.log('\nInitializing database...');
              try {
                // Create a temporary SQL file with credentials
                const tempSqlPath = path.join(__dirname, 'temp-init.sql');
                const sqlContent = `CREATE DATABASE IF NOT EXISTS ${dbName};\nUSE ${dbName};\n` + 
                                  fs.readFileSync(path.join(__dirname, 'db-init.sql'), 'utf8')
                                    .replace(/CREATE DATABASE.*?;/g, '')
                                    .replace(/USE.*?;/g, '');
                
                fs.writeFileSync(tempSqlPath, sqlContent);
                
                // Execute the SQL file
                execSync(`mysql -h ${host} -u ${user} ${password ? `-p${password}` : ''} < ${tempSqlPath}`, { stdio: 'inherit' });
                
                // Remove the temporary file
                fs.unlinkSync(tempSqlPath);
                
                console.log('Database initialized successfully.');
              } catch (error) {
                console.error('Failed to initialize database:', error.message);
                console.log('You can manually initialize the database using the db-init.sql file.');
              }
            }
            
            console.log('\nSetup complete! You can now start the application with:');
            console.log('npm run dev:full');
            
            rl.close();
          });
        });
      });
    });
  });
};

promptForConfig();