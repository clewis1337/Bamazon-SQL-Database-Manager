DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  item_id INT NOT NULL,
  product_name VARCHAR(100) NULL,
  department_name VARCHAR(100) NULL,
  price DECIMAL(10,2) NULL,
  stock_quantity INT NULL,
  product_sales DECIMAL(50,2) NULL,
  PRIMARY KEY (position)
);

CREATE TABLE departments (
  department_id INT NOT NULL,
  department_name VARCHAR(100) NULL,
  over_head_costs DECIMAL(50,2) NULL,
  PRIMARY KEY (department_id)
);

SELECT t1.department_name, SUM(t2.product_sales)
FROM departments as t1, products as t2
WHERE t2.department_name = t1.department_name
GROUP BY t2.department_name
ORDER BY t1.department_id;

SELECT * FROM products;
