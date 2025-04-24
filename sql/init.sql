CREATE DATABASE IF NOT EXISTS wms;
USE wms;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin', 'operator') DEFAULT 'operator'
);

CREATE TABLE materials (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category ENUM('plastic','rubber','aluminum','steel','electronic') NOT NULL,
  current_stock DECIMAL(10,2) DEFAULT 0,
  threshold DECIMAL(10,2) NOT NULL,
  expiry_date DATE
);