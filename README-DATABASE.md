# Excel Flow Analyzer - Database Setup

This document explains how to set up and run the application with the MySQL database.

## Prerequisites

1. MySQL server installed and running
2. Node.js and npm installed

## Database Setup

1. Create a MySQL database named `excel_flow_analyzer`
2. Create a MySQL user with access to this database
3. Update the `.env` file with your database credentials:

```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=excel_flow_analyzer
```

## Initialize the Database

Run the following command to create the necessary tables and insert sample data:

```
node init-sales-table.js
```

## Running the Application

You can run both the backend server and frontend application with a single command:

```
start-app.bat
```

Or run them separately:

1. Start the backend server:
   ```
   node server.js
   ```

2. Start the frontend application:
   ```
   npm run dev
   ```

## API Endpoints

The application uses the following API endpoints:

- `GET /api/sales` - Get all sales items
- `POST /api/sales` - Add a new sales item
- `DELETE /api/sales/:id` - Delete a sales item
- `POST /api/sales/upload` - Upload Excel file
- `GET /api/sales/summary` - Get sales summary
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

## Troubleshooting

If you encounter any issues:

1. Check that MySQL is running
2. Verify your database credentials in the `.env` file
3. Check the server logs for any errors
4. Make sure the database tables are created correctly