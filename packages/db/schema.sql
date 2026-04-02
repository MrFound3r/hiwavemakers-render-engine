-- Create the database
CREATE DATABASE IF NOT EXISTS hiwave;
-- Use the database
USE hiwave_render;
-- Create the renders table
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

-- Create the students table
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_uuid VARCHAR(36) NOT NULL,
    student_uuid VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    videos JSON DEFAULT (JSON_ARRAY()), 
    render_status VARCHAR(50) DEFAULT 'not rendered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX(room_uuid),
    INDEX(student_uuid)
);