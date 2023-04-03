# Excel Flow Analyzer - Local Testing and AWS Deployment Guide

This guide will help you test the application locally and deploy it to AWS.

## Local Testing

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Step 1: Navigate to the Project Directory

Make sure you're in the correct directory:

```bash
cd excel-flow-analyzer
```

### Step 2: Install Dependencies

Install both frontend and backend dependencies:

```bash
node install-mysql-deps.js
```

This script will install:
- MySQL-related packages (mysql2, express, cors, dotenv, multer)
- Development tools (concurrently, nodemon)

### Step 3: Configure MySQL

Run the setup script to configure your MySQL connection:

```bash
node setup.js
```

This will:
1. Prompt for your MySQL host, username, password, and database name
2. Create a `.env` file with your configuration
3. Optionally initialize the database with sample data

If you prefer to set up manually:

1. Create a `.env` file in the project root with:
```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=excel_flow_analyzer
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=1d
```

2. Initialize the database:
```bash
mysql -u your_mysql_username -p < db-init.sql
```

### Step 4: Start the Application

Start both the frontend and backend servers:

```bash
npm run dev:full
```

This will start:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Step 5: Test the Application

1. Open your browser and navigate to http://localhost:5173
2. Test the following features:
   - View sales data (should load from MySQL)
   - Add a new sales item
   - Delete a sales item
   - Upload an Excel file with sales data
   - View sales summary statistics

## AWS Deployment

### Prerequisites

- AWS account
- AWS CLI installed and configured
- Basic knowledge of AWS services (EC2, RDS, Elastic Beanstalk)

### Option 1: Automated Deployment

Use the provided deployment script:

```bash
node aws-deploy.js
```

This script will:
1. Build the application
2. Create a deployment package
3. Provide options for deploying to EC2 or Elastic Beanstalk

### Option 2: Manual Deployment

#### Step 1: Set Up RDS (MySQL Database)

1. Log in to the AWS Management Console
2. Navigate to RDS
3. Click "Create database"
4. Select MySQL
5. Configure your database:
   - DB instance identifier: excel-flow-analyzer
   - Master username: admin (or your preferred username)
   - Master password: (create a secure password)
   - DB instance size: Choose as per your needs (t2.micro for free tier)
   - Storage: General Purpose SSD, 20GB
   - Enable public access if needed for development
6. Create database

Once the database is created:
1. Note the endpoint URL
2. Connect to the database using a MySQL client
3. Run the db-init.sql script to initialize the database

#### Step 2: Deploy Backend to EC2

1. Launch an EC2 instance:
   - Amazon Linux 2 AMI
   - t2.micro (free tier eligible)
   - Configure security group to allow HTTP (80), HTTPS (443), and SSH (22)
   - Launch and connect to the instance

2. Install Node.js on the EC2 instance:
```bash
sudo yum update -y
curl -sL https://rpm.nodesource.com/setup_16.x | sudo bash -
sudo yum install -y nodejs
```

3. Build the application locally:
```bash
npm run build
```

4. Create a deployment package:
```bash
mkdir deploy
cp -r dist server.js package.json .env.example deploy/
cd deploy
# Edit package.json to include only production dependencies
# Create a proper .env file with RDS configuration
```

5. Upload the deployment package to EC2:
```bash
scp -i your-key.pem -r deploy ec2-user@your-ec2-instance-ip:~/excel-flow-analyzer
```

6. On the EC2 instance:
```bash
cd excel-flow-analyzer
npm install
# Create .env file with RDS configuration
npm start
```

7. Set up a reverse proxy with Nginx:
```bash
sudo amazon-linux-extras install nginx1
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure Nginx
sudo nano /etc/nginx/conf.d/excel-flow-analyzer.conf
```

Add the following configuration:
```
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Restart Nginx:
```bash
sudo systemctl restart nginx
```

#### Step 3: Set Up a Domain (Optional)

1. Register a domain through Route 53 or another registrar
2. Create a DNS record pointing to your EC2 instance
3. Set up HTTPS with Let's Encrypt:
```bash
sudo yum install -y certbot python-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Option 3: Deploy to Elastic Beanstalk

1. Install the EB CLI:
```bash
pip install awsebcli
```

2. Initialize EB in your project:
```bash
eb init
```

3. Create an environment:
```bash
eb create excel-flow-analyzer-env
```

4. Configure environment variables for RDS connection:
```bash
eb setenv DB_HOST=your-rds-endpoint.amazonaws.com DB_USER=admin DB_PASSWORD=your-password DB_NAME=excel_flow_analyzer
```

5. Deploy the application:
```bash
eb deploy
```

## Troubleshooting

### Local Development Issues

1. **MySQL Connection Error**
   - Check that MySQL is running: `sudo service mysql status`
   - Verify credentials in .env file
   - Test connection: `mysql -u your_username -p`

2. **Port Already in Use**
   - Change the port in .env file
   - Check for processes using the port: `lsof -i :3001`

### AWS Deployment Issues

1. **RDS Connection Issues**
   - Check security group settings to allow traffic from EC2
   - Verify endpoint URL, username, and password
   - Test connection from EC2: `mysql -h your-rds-endpoint -u admin -p`

2. **EC2 Application Not Starting**
   - Check logs: `journalctl -u excel-flow-analyzer`
   - Verify Node.js is installed: `node -v`
   - Check .env file configuration

3. **Elastic Beanstalk Deployment Failures**
   - Check EB logs: `eb logs`
   - Verify environment variables are set correctly
   - Check that the application works locally before deploying