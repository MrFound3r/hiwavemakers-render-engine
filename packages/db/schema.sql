CREATE DATABASE IF NOT EXISTS hiwave_render;
USE hiwave_render;

-- CREATE RENDERS TABLE
CREATE TABLE renders (
  id VARCHAR(50) PRIMARY KEY,
  composition_id VARCHAR(100),
  status VARCHAR(20),
  input JSON,
  output_path TEXT,
  thumbnail_path TEXT,
  error TEXT,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  cancelled BOOLEAN DEFAULT FALSE,
  progress FLOAT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_status (status)
);

-- CREATE STUDENTS TABLE
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_uuid VARCHAR(36) NOT NULL,
    student_uuid VARCHAR(36) NOT NULL, 
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    videos JSON DEFAULT (JSON_ARRAY()), 
    render_id VARCHAR(50) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room (room_uuid),
    INDEX idx_student (student_uuid),
    UNIQUE KEY unique_room_student (room_uuid, student_uuid),
    CONSTRAINT fk_student_render 
    FOREIGN KEY (render_id) REFERENCES renders(id) 
    ON DELETE SET NULL
);