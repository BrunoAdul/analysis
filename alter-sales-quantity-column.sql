-- Migration script to alter quantity column in sales_items table to VARCHAR(20)
ALTER TABLE sales_items
MODIFY COLUMN quantity VARCHAR(20) NOT NULL;
