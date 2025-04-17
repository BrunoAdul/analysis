const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Excel Flow Analyzer - Installing MySQL Dependencies');
console.log('================================================');

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('Error: package.json not found. Make sure you are in the project root directory.');
  process.exit(1);
}

// Install MySQL dependencies
console.log('\nInstalling MySQL dependencies...');
try {
  execSync('npm install mysql2 express cors dotenv multer --save', { stdio: 'inherit' });
  console.log('MySQL dependencies installed successfully.');
} catch (error) {
  console.error('Failed to install MySQL dependencies:', error.message);
  process.exit(1);
}

// Install dev dependencies
console.log('\nInstalling development dependencies...');
try {
  execSync('npm install concurrently nodemon --save-dev', { stdio: 'inherit' });
  console.log('Development dependencies installed successfully.');
} catch (error) {
  console.error('Failed to install development dependencies:', error.message);
  process.exit(1);
}

console.log('\nAll dependencies installed successfully!');
console.log('\nNext steps:');
console.log('1. Run "node setup.js" to configure your MySQL connection');
console.log('2. Start the application with "npm run dev:full"');