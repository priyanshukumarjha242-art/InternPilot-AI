CREATE DATABASE IF NOT EXISTS internpilot;
USE internpilot;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    college VARCHAR(255),
    branch VARCHAR(255),
    graduation_year INT,
    skills TEXT,
    github VARCHAR(255),
    linkedin VARCHAR(255),
    resume_link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    application_date DATE NOT NULL,
    deadline DATE,
    status ENUM('Applied', 'Interview', 'Selected', 'Rejected') DEFAULT 'Applied',
    location VARCHAR(255),
    job_link VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
