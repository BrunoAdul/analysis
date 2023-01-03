# Excel Flow Analyzer

## Demo

![Demo](demo.gif)

A comprehensive web application for analyzing Excel data with a focus on sales analytics. This tool helps businesses track sales performance, visualize data trends, and generate insightful reports from Excel spreadsheets.

## What It Does

Excel Flow Analyzer transforms your raw sales data from Excel files into actionable insights:

- **Automated Data Processing**: Upload Excel files and automatically extract sales information
- **Visual Analytics**: View your sales data through charts, graphs, and summary statistics
- **Performance Tracking**: Monitor revenue, profit margins, and product performance over time
- **Decision Support**: Identify trends and patterns to inform business decisions

## Features

- **Data Import**: Upload Excel files with sales data
- **Interactive Dashboard**: Visualize key metrics and performance indicators
- **Sales Analysis**: Track revenue, profit margins, and product performance
- **User Management**: Role-based access control (Admin, Manager, User)
- **Data Export**: Generate and download reports

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- Web browser (Chrome, Firefox, Edge recommended)

### Step 1: Clone the Repository

```bash
git clone https://github.com/BrunoAdul/analysis.git
cd analysis
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Database

1. Create a MySQL database:
   ```sql
   CREATE DATABASE excel_flow_analyzer;
   ```

2. Create a database user (or use an existing one):
   ```sql
   CREATE USER 'dbuser'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON excel_flow_analyzer.* TO 'dbuser'@'localhost';
   FLUSH PRIVILEGES;
   ```

3. Copy the example environment file and update it with your database details:
   ```bash
   cp .env.example .env
   ```
   
4. Edit the `.env` file with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=dbuser
   DB_PASSWORD=your_password
   DB_NAME=excel_flow_analyzer
   ```

### Step 4: Initialize the Database

Run the database initialization script:
```bash
node init-db.js
```

### Step 5: Run the Application

For Windows users:
```bash
run-app.bat
```

For Mac/Linux users:
```bash
# Start backend server
node server.js
# In a separate terminal, start frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:3001/api

## Default Login Credentials

| Role    | Email               | Password  |
|---------|---------------------|-----------|
| Admin   | admin@example.com   | admin123  |
| Manager | manager@example.com | manager123|
| User    | user@example.com    | user123   |

## Usage Guide

1. **Login**: Use the provided credentials to access the system
2. **Upload Data**: Navigate to the Data Import section and upload your Excel files
3. **View Dashboard**: Explore the automatically generated analytics
4. **Generate Reports**: Export insights as PDF or Excel files

## Troubleshooting

If you encounter issues:

1. Verify MySQL is running and accessible
2. Confirm database user credentials are correct
3. Check that ports 3001 and 8080 are available
4. Review server logs for specific error messages

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with React, Express, and MySQL
- Uses Tailwind CSS for styling
- Chart.js for data visualization

## Demo

![Demo](demo.gif)
