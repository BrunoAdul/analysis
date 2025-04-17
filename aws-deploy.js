const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('Excel Flow Analyzer - AWS Deployment Helper');
console.log('==========================================');

// Check if AWS CLI is installed
try {
  execSync('aws --version', { stdio: 'pipe' });
  console.log('AWS CLI is installed.');
} catch (error) {
  console.error('AWS CLI is not installed or not in PATH. Please install AWS CLI first:');
  console.error('https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html');
  process.exit(1);
}

// Check if user is logged in to AWS
try {
  execSync('aws sts get-caller-identity', { stdio: 'pipe' });
  console.log('You are logged in to AWS.');
} catch (error) {
  console.error('You are not logged in to AWS. Please run "aws configure" first.');
  process.exit(1);
}

// Build the application
const buildApp = () => {
  console.log('\nBuilding the application...');
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('Application built successfully.');
  } catch (error) {
    console.error('Failed to build the application:', error.message);
    process.exit(1);
  }
};

// Create deployment package
const createDeploymentPackage = () => {
  console.log('\nCreating deployment package...');
  
  // Create a deploy directory if it doesn't exist
  const deployDir = path.join(__dirname, 'deploy');
  if (!fs.existsSync(deployDir)) {
    fs.mkdirSync(deployDir);
  }
  
  // Copy necessary files
  try {
    // Copy server.js
    fs.copyFileSync(
      path.join(__dirname, 'server.js'),
      path.join(deployDir, 'server.js')
    );
    
    // Copy package.json (with modifications for production)
    const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
    
    // Move server dependencies to dependencies
    if (packageJson.serverDependencies) {
      Object.keys(packageJson.serverDependencies).forEach(dep => {
        packageJson.dependencies[dep] = packageJson.serverDependencies[dep];
      });
      delete packageJson.serverDependencies;
    }
    
    // Remove devDependencies
    delete packageJson.devDependencies;
    
    // Update scripts
    packageJson.scripts = {
      start: 'node server.js'
    };
    
    fs.writeFileSync(
      path.join(deployDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    // Copy dist directory
    const distDir = path.join(__dirname, 'dist');
    const deployDistDir = path.join(deployDir, 'dist');
    
    if (!fs.existsSync(distDir)) {
      console.error('dist directory not found. Make sure you built the application.');
      process.exit(1);
    }
    
    // Create dist directory in deploy if it doesn't exist
    if (!fs.existsSync(deployDistDir)) {
      fs.mkdirSync(deployDistDir);
    }
    
    // Copy all files from dist to deploy/dist
    const copyDir = (src, dest) => {
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          if (!fs.existsSync(destPath)) {
            fs.mkdirSync(destPath);
          }
          copyDir(srcPath, destPath);
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    copyDir(distDir, deployDistDir);
    
    // Create .env.example file
    const envExample = `# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_HOST=your-rds-endpoint.amazonaws.com
DB_USER=admin
DB_PASSWORD=your-password
DB_NAME=excel_flow_analyzer

# JWT Secret for Authentication (for future use)
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
`;
    
    fs.writeFileSync(path.join(deployDir, '.env.example'), envExample);
    
    // Create a simple README for deployment
    const deployReadme = `# Excel Flow Analyzer - AWS Deployment

This package contains the built application ready for deployment to AWS.

## Files

- server.js - Express server that serves the API and static files
- package.json - Dependencies and scripts for the server
- dist/ - Built frontend application
- .env.example - Example environment configuration (rename to .env and update)

## Deployment Steps

1. Upload this entire directory to your EC2 instance or Elastic Beanstalk
2. Install dependencies: \`npm install\`
3. Create a .env file based on .env.example
4. Start the server: \`npm start\`

For RDS setup, use the db-init.sql script from the original repository.
`;
    
    fs.writeFileSync(path.join(deployDir, 'README.md'), deployReadme);
    
    // Create a zip file
    console.log('Creating ZIP archive...');
    const zipFilename = 'excel-flow-analyzer-deploy.zip';
    const zipPath = path.join(__dirname, zipFilename);
    
    // Remove existing zip if it exists
    if (fs.existsSync(zipPath)) {
      fs.unlinkSync(zipPath);
    }
    
    // Create zip file
    execSync(`cd "${deployDir}" && zip -r "${zipPath}" .`, { stdio: 'inherit' });
    
    console.log(`\nDeployment package created: ${zipFilename}`);
    
    return zipPath;
  } catch (error) {
    console.error('Failed to create deployment package:', error.message);
    process.exit(1);
  }
};

// AWS deployment options
const deployToAWS = (zipPath) => {
  console.log('\nAWS Deployment Options:');
  console.log('1. Deploy to EC2 (instructions)');
  console.log('2. Deploy to Elastic Beanstalk');
  console.log('3. Skip AWS deployment');
  
  rl.question('\nSelect an option (1-3): ', (option) => {
    switch (option) {
      case '1':
        // EC2 instructions
        console.log('\nTo deploy to EC2:');
        console.log('1. Connect to your EC2 instance');
        console.log('2. Install Node.js and npm');
        console.log('3. Upload the deployment package to your instance');
        console.log('4. Unzip the package: unzip excel-flow-analyzer-deploy.zip');
        console.log('5. Install dependencies: npm install');
        console.log('6. Create a .env file with your configuration');
        console.log('7. Start the server: npm start (or use PM2: pm2 start server.js)');
        rl.close();
        break;
        
      case '2':
        // Elastic Beanstalk deployment
        rl.question('\nEnter your Elastic Beanstalk application name: ', (appName) => {
          rl.question('Enter your Elastic Beanstalk environment name: ', (envName) => {
            console.log('\nDeploying to Elastic Beanstalk...');
            try {
              execSync(`aws elasticbeanstalk create-application-version --application-name "${appName}" --version-label "v-${Date.now()}" --source-bundle S3Bucket="elasticbeanstalk-samples-us-east-1",S3Key="${zipPath}"`, { stdio: 'inherit' });
              execSync(`aws elasticbeanstalk update-environment --application-name "${appName}" --environment-name "${envName}" --version-label "v-${Date.now()}"`, { stdio: 'inherit' });
              console.log('Deployment initiated. Check the AWS Elastic Beanstalk console for status.');
            } catch (error) {
              console.error('Failed to deploy to Elastic Beanstalk:', error.message);
              console.log('You can manually deploy the zip file through the AWS console.');
            }
            rl.close();
          });
        });
        break;
        
      case '3':
      default:
        console.log('\nSkipping AWS deployment. You can manually deploy the package later.');
        console.log(`Deployment package is available at: ${zipPath}`);
        rl.close();
        break;
    }
  });
};

// Main execution
console.log('\nThis script will help you prepare and deploy the application to AWS.');
rl.question('Do you want to continue? (y/n): ', (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('Deployment cancelled.');
    rl.close();
    return;
  }
  
  buildApp();
  const zipPath = createDeploymentPackage();
  deployToAWS(zipPath);
});