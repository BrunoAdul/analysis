-- Create the sales_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS sales_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  order_number VARCHAR(50) NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  selling_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  buying_price DECIMAL(10, 2) NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  profit DECIMAL(10, 2) NOT NULL,
  revenue DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert some sample data if the table is empty
INSERT INTO sales_items (date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue)
SELECT '2023-05-01', 'ORD-1001', 'Maize Flour', 100.00, 5, 70.00, 'Cash', 150.00, 500.00
WHERE NOT EXISTS (SELECT 1 FROM sales_items LIMIT 1);

INSERT INTO sales_items (date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue)
SELECT '2023-05-02', 'ORD-1002', 'Rice', 200.00, 3, 150.00, 'M-Pesa', 150.00, 600.00
WHERE NOT EXISTS (SELECT 1 FROM sales_items LIMIT 1);

INSERT INTO sales_items (date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue)
SELECT '2023-05-03', 'ORD-1003', 'Wheat Flour', 50.00, 10, 30.00, 'Card', 200.00, 500.00
WHERE NOT EXISTS (SELECT 1 FROM sales_items LIMIT 1);

INSERT INTO sales_items (date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue)
SELECT '2023-05-04', 'ORD-1004', 'Sugar', 120.00, 8, 90.00, 'Cash', 240.00, 960.00
WHERE NOT EXISTS (SELECT 1 FROM sales_items LIMIT 1);

INSERT INTO sales_items (date, order_number, item_name, selling_price, quantity, buying_price, payment_mode, profit, revenue)
SELECT '2023-05-05', 'ORD-1005', 'Cooking Oil', 250.00, 2, 200.00, 'M-Pesa', 100.00, 500.00
WHERE NOT EXISTS (SELECT 1 FROM sales_items LIMIT 1);