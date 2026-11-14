CREATE DATABASE IF NOT EXISTS `revista_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `revista_db`;

CREATE TABLE IF NOT EXISTS `stores` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `category` VARCHAR(50) NOT NULL,
  `owner` VARCHAR(100) NOT NULL,
  `owner_email` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `salt` VARCHAR(64) NOT NULL,
  `address` VARCHAR(255) NULL,
  `phone` VARCHAR(30) NULL,
  `table_count` INT NOT NULL DEFAULT 0,
  `wifi_name` VARCHAR(50) NULL,
  `trend` VARCHAR(20) DEFAULT '0%',
  `role` ENUM('admin', 'owner') DEFAULT 'owner',
  `session_version` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_owner_email` (`owner_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `anon_id` VARCHAR(20) NOT NULL,
  `store_id` VARCHAR(50) NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NOT NULL,
  `sentiment` ENUM('Positif', 'Netral', 'Negatif') NOT NULL,
  `confidence` INT DEFAULT 90,
  `highlight` TINYINT(1) DEFAULT 0,
  `photos` MEDIUMTEXT NULL,
  `ip_hash` VARCHAR(64) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_store_created` (`store_id`, `created_at`),
  INDEX `idx_sentiment` (`sentiment`),
  FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Akun Default Master Admin REVISTA:
-- Email: admin@revista.id
-- Password: admin123
INSERT INTO `stores` (`id`, `name`, `category`, `owner`, `owner_email`, `password_hash`, `salt`, `role`, `trend`) 
VALUES (
  'store-admin',
  'REVISTA Central Admin',
  'Admin Pusat',
  'Master Admin',
  'admin@revista.id',
  '4599642990ddb04c03a6707cb4eb4cc4dbf078246707a36bdf6228c93a397c8dd75e04068390ec24ca617349c21f6d9a882c0f3bde5ae077ad81be2bc36f81ab',
  '746c168f61ddf06293ae697aa1dcfcde',
  'admin',
  '+0%'
) ON DUPLICATE KEY UPDATE `role` = 'admin';
