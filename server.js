const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
const allowedOrigins = ['http://localhost:5173', 'http://localhost:8081', 'http://localhost:8080'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allow credentials
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = './uploads';
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Database connection
let pool;
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
  
  pool = mysql.createPool(dbConfig);
  console.log('MySQL connection pool created');
} catch (error) {
  console.error('Error creating MySQL connection pool:', error);
}

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request for: ${req.url}`);
  next();
});

// Create auth router
const authRouter = express.Router();

// Auth routes
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT id, email, name, role FROM users WHERE email = ? AND password_hash = ?', [email, password]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

authRouter.post('/register', async (req, res) => {
    console.log('Registration endpoint hit! Request body:', req.body);
    console.log('Full request details:', {
        method: req.method,
        url: req.url,
        path: req.path,
        originalUrl: req.originalUrl,
        baseUrl: req.baseUrl
    });
    const { email, password, name } = req.body;

    try {
        // Check if the user already exists
        const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Insert the new user into the database with default role 'user'
        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)',
            [email, password, name, 'user']
        );

        // Respond with the created user data (excluding password)
        const newUser = { id: result.insertId, email, name, role: 'user' };
        res.status(201).json(newUser);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ 
            error: 'Failed to register user', 
            details: error.message,
            sqlMessage: error.sqlMessage || 'No SQL message',
            sqlState: error.sqlState || 'No SQL state'
        });
    }
});

// Add verify-session endpoint
authRouter.get('/verify-session', async (req, res) => {
    try {
        // Get user ID from authorization header
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const userId = authHeader.split(' ')[1];
        
        if (!userId) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        // Fetch user from database
        const [users] = await pool.query('SELECT id, email, name, role FROM users WHERE id = ?', [userId]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        res.json(users[0]);
    } catch (error) {
        console.error('Error verifying session:', error);
        res.status(500).json({ error: 'Failed to verify session' });
    }
});

// Add logout endpoint - client-side only since we're not using server-side sessions
authRouter.post('/logout', (req, res) => {
    res.json({ success: true });
});

// Log all incoming requests before routing
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Mount auth router with explicit logging
app.use('/api/auth', (req, res, next) => {
  console.log(`Auth router handling: ${req.method} ${req.originalUrl}`);
  next();
}, authRouter);

// Add a test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Server is running correctly',
    time: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || '3001',
      dbHost: process.env.DB_HOST || 'localhost',
      dbUser: process.env.DB_USER || 'root',
      dbName: process.env.DB_NAME || 'excel_flow_analyzer'
    }
  });
});

// Detailed path logging middleware
app.use((req, res, next) => {
  console.log('Request received:', {
    method: req.method,
    originalUrl: req.originalUrl,
    path: req.path,
    baseUrl: req.baseUrl,
    url: req.url
  });
  next();
});

// Catch-all route for logging
app.use((req, res, next) => {
  console.log(`Catch-all route hit for: ${req.url}`);
  next();
});

// Temporarily disable static files for testing
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, 'dist')));
// }

// GET /api/sales - Get all sales items
app.get('/api/sales', async (req, res) => {
  try {
    console.log('Fetching all sales items');
    const [rows] = await pool.query('SELECT * FROM sales_items');
    console.log(`Retrieved ${rows.length} sales items`);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching sales items:', error);
    res.status(500).json({ error: 'Failed to fetch sales items' });
  }
});

// POST /api/sales - Add a new sales item
app.post('/api/sales', async (req, res) => {
  try {
    const { 
      date, 
      order_number, 
      item_name, 
      selling_price, 
      quantity, 
      buying_price, 
      payment_mode, 
      profit, 
      revenue 
    } = req.body;
    
    console.log('Adding new sales item:', req.body);
    
    const [result] = await pool.query(
      `INSERT INTO sales_items 
       (date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue]
    );
    
    const newItem = {
      id: result.insertId,
      date,
      order_number,
      item_name,
      selling_price,
      quantity,
      buying_price,
      payment_mode,
      profit,
      revenue
    };
    
    console.log('Added new sales item with ID:', result.insertId);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding sales item:', error);
    res.status(500).json({ error: 'Failed to add sales item' });
  }
});

// DELETE /api/sales/:id - Delete a sales item
app.delete('/api/sales/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Deleting sales item with ID:', id);
    
    const [result] = await pool.query('DELETE FROM sales_items WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      console.log('No item found with ID:', id);
      return res.status(404).json({ error: 'Sales item not found' });
    }
    
    console.log('Deleted sales item with ID:', id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting sales item:', error);
    res.status(500).json({ error: 'Failed to delete sales item' });
  }
});

const XLSX = require('xlsx');

// POST /api/sales/upload - Upload Excel file
app.post('/api/sales/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File uploaded:', req.file.path);

    // Read the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    console.log(`Parsed Excel data rows: ${jsonData.length}`);
    if (jsonData.length > 0) {
      console.log('Sample row:', jsonData[0]);
    }

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ error: 'Excel file is empty or invalid' });
    }

    // Validate required columns in Excel
    const requiredColumns = ['date', 'no', 'item', 'price', 'quantity', 'buying price', 'payment mode'];
    const excelColumns = Object.keys(jsonData[0]).map(col => col.toLowerCase());

    console.log('Detected Excel columns:', excelColumns);

    for (const col of requiredColumns) {
      if (!excelColumns.includes(col)) {
        console.log(`Missing required column: ${col}`);
        return res.status(400).json({ error: `Missing required column: ${col}` });
      }
    }

    // Validate that no rows have null or undefined 'no' (order_number)
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (row['no'] === null || row['no'] === undefined) {
        console.log(`Missing order number (no) in row ${i + 2}`);
        return res.status(400).json({ error: `Missing order number (no) in row ${i + 2}` }); // +2 for header + 1-based index
      }
    }

    // Helper function to convert Excel serial date to ISO string
    function excelDateToJSDate(serial) {
      if (typeof serial === 'number') {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;                                        
        const date_info = new Date(utc_value * 1000);
        const fractional_day = serial - Math.floor(serial) + 0.0000001;
        let total_seconds = Math.floor(86400 * fractional_day);
        const seconds = total_seconds % 60;
        total_seconds -= seconds;
        const hours = Math.floor(total_seconds / (60 * 60));
        const minutes = Math.floor(total_seconds / 60) % 60;
        date_info.setHours(hours);
        date_info.setMinutes(minutes);
        date_info.setSeconds(seconds);
        return date_info.toISOString().split('T')[0]; // Return date part only
      } else if (typeof serial === 'string') {
        // If already a string, try to parse and return ISO date string
        const d = new Date(serial);
        if (!isNaN(d)) {
          return d.toISOString().split('T')[0];
        }
        return null;
      } else {
        return null;
      }
    }
    
    // Map Excel columns to database fields and prepare insert data
    const salesItems = jsonData.map(row => {
      let orderNumberRaw = row['no'];
      let orderNumberStr = '';
      if (orderNumberRaw === null || orderNumberRaw === undefined) {
        orderNumberStr = '';
      } else if (typeof orderNumberRaw === 'number') {
        orderNumberStr = 'ORD-' + orderNumberRaw.toString();
      } else {
        orderNumberStr = orderNumberRaw.toString();
      }
      return {
        date: excelDateToJSDate(row['date']),
        order_number: orderNumberStr,
        item_name: row['item'],
        selling_price: parseFloat(row['price']) || 0,
        quantity: parseFloat(row['quantity']) || 0,
        buying_price: parseFloat(row['buying price']) || 0,
        payment_mode: row['payment mode'],
        profit: 0,  // will calculate below
        revenue: 0  // will calculate below
      };
    });

    // Calculate profit and revenue for each item
    salesItems.forEach(item => {
      item.revenue = item.selling_price;
      item.profit = item.selling_price - item.buying_price;
    });

    console.log('Prepared sales items for insertion:', salesItems);

    // Insert sales items into database
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const insertedItems = [];
      for (const item of salesItems) {
        const [result] = await connection.query(
          `INSERT INTO sales_items 
           (date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            item.date,
            item.order_number,
            item.item_name,
            item.selling_price,
            item.quantity,
            item.buying_price,
            item.payment_mode,
            item.profit,
            item.revenue
          ]
        );
        insertedItems.push({ id: result.insertId, ...item });
      }

      await connection.commit();

      // Return inserted records
      res.json(insertedItems);
    } catch (dbError) {
      await connection.rollback();
      console.error('Database error inserting sales items:', dbError);
      res.status(500).json({ error: 'Failed to insert sales items into database' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to process uploaded file', message: error.message, stack: error.stack });
  }
});

// GET /api/sales/summary - Get sales summary
app.get('/api/sales/summary', async (req, res) => {
  try {
    console.log('Fetching sales summary');
    
    // Query to get sales summary data
    const [summaryResult] = await pool.query(`
      SELECT 
        SUM(revenue) AS totalRevenue,
        SUM(profit) AS totalProfit,
        SUM(quantity) AS totalSales,
        AVG(revenue) AS averageOrderValue
      FROM sales_items
    `);
    
    // Query to get top selling items
    const [topItemsResult] = await pool.query(`
      SELECT item_name AS name, SUM(quantity) AS quantity
      FROM sales_items
      GROUP BY item_name
      ORDER BY quantity DESC
      LIMIT 5
    `);
    
    // Query to get payment methods
    const [paymentMethodsResult] = await pool.query(`
      SELECT payment_mode AS method, COUNT(*) AS count
      FROM sales_items
      GROUP BY payment_mode
    `);
    
    // Return the summary data
    const summary = {
      totalRevenue: summaryResult[0].totalRevenue || 0,
      totalProfit: summaryResult[0].totalProfit || 0,
      totalSales: summaryResult[0].totalSales || 0,
      averageOrderValue: summaryResult[0].averageOrderValue || 0,
      topSellingItems: topItemsResult,
      paymentMethods: paymentMethodsResult
    };
    
    console.log('Sales summary:', summary);
    res.json(summary);
  } catch (error) {
    console.error('Error fetching sales summary:', error);
    res.status(500).json({ error: 'Failed to fetch sales summary' });
  }
});

// GET /api/users - Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, name, role FROM users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/users/:id/role - Update user role
app.put('/api/users/:id/role', async (req, res) => {
  const userId = req.params.id;
  const { role } = req.body;

  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }

  try {
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// DELETE /api/users/:id - Delete a user
app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
