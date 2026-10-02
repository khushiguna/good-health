-- =====================================================================
-- Good Health and Well-Being Database Schema (MySQL)
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `good_health_db` 
  DEFAULT CHARACTER SET utf8mb4 
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `good_health_db`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `last_login_at` TIMESTAMP NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DROP old tasks tables
DROP TABLE IF EXISTS `custom_tasks`;
DROP TABLE IF EXISTS `suggestion_tasks`;

-- 2. Category-Wise Task Tables
-- Food Tasks
CREATE TABLE IF NOT EXISTS `tasks_food` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` INT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `name` VARCHAR(255) NOT NULL,
  `tip` TEXT NULL,
  `icon` VARCHAR(16) DEFAULT '📝',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exercise Tasks
CREATE TABLE IF NOT EXISTS `tasks_exercise` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` INT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `name` VARCHAR(255) NOT NULL,
  `tip` TEXT NULL,
  `icon` VARCHAR(16) DEFAULT '📝',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mental Tasks
CREATE TABLE IF NOT EXISTS `tasks_mental` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` INT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `name` VARCHAR(255) NOT NULL,
  `tip` TEXT NULL,
  `icon` VARCHAR(16) DEFAULT '📝',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sleep Tasks
CREATE TABLE IF NOT EXISTS `tasks_sleep` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` INT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `name` VARCHAR(255) NOT NULL,
  `tip` TEXT NULL,
  `icon` VARCHAR(16) DEFAULT '📝',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Habits Tasks
CREATE TABLE IF NOT EXISTS `tasks_habits` (
  `id` VARCHAR(64) PRIMARY KEY,
  `user_id` INT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `name` VARCHAR(255) NOT NULL,
  `tip` TEXT NULL,
  `icon` VARCHAR(16) DEFAULT '📝',
  `display_order` INT DEFAULT 0,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Task Completions / Daily History Table
CREATE TABLE IF NOT EXISTS `task_completions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `task_id` VARCHAR(64) NOT NULL,
  `category` VARCHAR(50) DEFAULT 'general',
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `log_date` DATE NOT NULL,
  `status` ENUM('pending', 'done') DEFAULT 'done',
  `user_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `idx_daily_task` (`task_id`, `log_date`, `condition_key`, `user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_log_date` (`log_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. User Daily Logs (For streaks and daily reset snapshots)
CREATE TABLE IF NOT EXISTS `user_daily_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `score_percent` DECIMAL(5,2) DEFAULT 0.00,
  `tasks_done` INT DEFAULT 0,
  `tasks_total` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_date_cond` (`user_id`, `log_date`, `condition_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4b. Category-Wise Daily Logs (Category specific completions and score)
CREATE TABLE IF NOT EXISTS `user_category_daily_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `log_date` DATE NOT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `category` VARCHAR(50) NOT NULL,
  `tasks_done` INT DEFAULT 0,
  `tasks_total` INT DEFAULT 0,
  `score_percent` DECIMAL(5,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_date_cond_cat` (`user_id`, `log_date`, `condition_key`, `category`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  INDEX `idx_user_date` (`user_id`, `log_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4c. User Category Preferences (Allows user to select which categories they want to focus on)
CREATE TABLE IF NOT EXISTS `user_category_preferences` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `is_enabled` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_cat` (`user_id`, `category`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Weekly Reports
CREATE TABLE IF NOT EXISTS `weekly_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `week_start` DATE NOT NULL,
  `week_end` DATE NOT NULL,
  `condition_key` VARCHAR(50) DEFAULT 'general',
  `total_tasks` INT DEFAULT 0,
  `completed_tasks` INT DEFAULT 0,
  `score_percent` DECIMAL(5,2) DEFAULT 0.00,
  `best_day` DATE,
  `best_day_score` DECIMAL(5,2) DEFAULT 0.00,
  `streak_days` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_user_week` (`user_id`, `week_start`, `condition_key`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Contact / Wellness Feedback Table
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `topic` VARCHAR(50) DEFAULT 'general',
  `message` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
