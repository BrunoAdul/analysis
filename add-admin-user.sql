-- SQL query to add or update an admin user
INSERT INTO users (name, email, password, role)
VALUES ('Bruno Adul', 'brunoadul@gmail.com', '66606@Admin', 'admin')
ON DUPLICATE KEY UPDATE
  name = 'Bruno Adul',
  password = '66606@Admin',
  role = 'admin';
