-- A big thank you to Rich Matthews for teaching me about Foreign keys to make the database more robust.
-- https://www.w3schools.com/sql/sql_foreignkey.asp
-- https://dev.mysql.com/doc/refman/5.6/en/create-table-foreign-keys.html
-- Create database
DROP DATABASE IF EXISTS employees_db;
CREATE DATABASE employees_db;
USE employees_db;

-- Create department table
CREATE TABLE department (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(30) NULL,
  PRIMARY KEY (id)
);

-- Create role table  (Foreign keys are used to permit cross-referencing related data across tables and foreign key constraints.  Which help keep the related data consistent.
CREATE TABLE role (
  id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  department_id INT, 
  CONSTRAINT fk_department FOREIGN KEY (department_id) REFERENCES department(id)  ON DELETE SET NULL,
  PRIMARY KEY (id)
);

-- Create Employee table
CREATE TABLE employee (
  id INT NOT NULL AUTO_INCREMENT,
  first_name VARCHAR (30) NOT NULL,
  last_name VARCHAR(30) NOT NULL,
  role_id INT, 
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES role(id) ON DELETE SET NULL,
  manager_id INT, 
  CONSTRAINT fk_manager FOREIGN KEY (manager_id) REFERENCES employee(id) ON DELETE SET NULL,
  PRIMARY KEY (id)
);