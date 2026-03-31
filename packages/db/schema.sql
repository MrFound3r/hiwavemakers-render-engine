-- Create the database
CREATE DATABASE IF NOT EXISTS hiwave;
-- Use the database
USE hiwave_render;
-- Create the renders table with all columns included
CREATE TABLE renders (
  id VARCHAR(50) PRIMARY KEY,
  composition_id VARCHAR(100),
  status VARCHAR(20),
  input JSON,
  output_path TEXT,
  error TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  cancelled BOOLEAN DEFAULT FALSE,
  progress FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Create index on status
CREATE INDEX idx_status ON renders(status);