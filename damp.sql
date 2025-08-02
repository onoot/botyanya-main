-- --------------------------------------------------------
-- Хост:                         127.0.0.1
-- Версия сервера:               5.7.33 - MySQL Community Server (GPL)
-- ОС Сервера:                   Win64
-- HeidiSQL Версия:              11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- -- Дамп структуры базы данных kaseevzk_forms
-- CREATE DATABASE IF NOT EXISTS `kaseevzk_forms` 
--   DEFAULT CHARACTER SET utf8mb4 
--   COLLATE utf8mb4_unicode_ci;
-- USE `kaseevzk_forms`;

-- Дамп структуры для таблица kaseevzk_forms.Ingredients
DROP TABLE IF EXISTS `Ingredients`;
CREATE TABLE IF NOT EXISTS `Ingredients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `category` varchar(255) NOT NULL,
  `packaging` varchar(100) DEFAULT NULL,
  `packaging_amount` float DEFAULT '1',
  `min_order` float DEFAULT '1',
  `max_order` float DEFAULT '1000',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4;

-- Дамп данных таблицы kaseevzk_forms.Ingredients: ~24 rows (приблизительно)
/*!40000 ALTER TABLE `Ingredients` DISABLE KEYS */;
INSERT INTO `Ingredients` (`id`, `name`, `unit`, `category`, `packaging`, `packaging_amount`, `min_order`, `max_order`, `created_at`, `updated_at`) VALUES
    (1, 'Говядина, подгруппа 1.1', 'кг', 'Мясо и печень 🥩', 'коробка', 20, 20, 600, NOW(), NOW()),
    (2, 'Печень', 'кг', 'Мясо и печень 🥩', 'коробка', 20, 20, 200, NOW(), NOW()),
    (3, 'Минтай', 'кг', 'Рыба 🐟', 'коробка', 24, 24, 600, NOW(), NOW()),
    (4, 'Горбуша', 'кг', 'Рыба 🐟', 'коробка', 22, 22, 594, NOW(), NOW()),
    (5, 'Горох', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, NOW(), NOW()),
    (6, 'Длинный рис', 'кг', 'Крупы 🌾', 'упаковка', 25, 25, 200, NOW(), NOW()),
    (7, 'Круглый рис', 'кг', 'Крупы 🌾', 'упаковка', 25, 25, 200, NOW(), NOW()),
    (8, 'Пропаренный рис', 'кг', 'Крупы 🌾', 'упаковка', 25, 25, 200, NOW(), NOW()),
    (9, 'Вермишель', 'кг', 'Крупы 🌾', 'упаковка', 20, 20, 200, NOW(), NOW()),
    (10, 'Рожки', 'кг', 'Крупы 🌾', 'упаковка', 20, 20, 200, NOW(), NOW()),
    (11, 'Перловая', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, NOW(), NOW()),
    (12, 'Ячневая', 'кг', 'Крупы 🌾', 'упаковка', 40, 40, 200, NOW(), NOW()),
    (13, 'Манка', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, NOW(), NOW()),
    (14, 'Пшеничная', 'кг', 'Крупы 🌾', 'упаковка', 40, 40, 200, NOW(), NOW()),
    (15, 'Пшено', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, NOW(), NOW()),
    (16, 'Овсянка', 'кг', 'Крупы 🌾', 'упаковка', 5, 5, 50, NOW(), NOW()),
    (17, 'Гречневая', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, NOW(), NOW()),
    (18, 'Зеленый горошек', 'шт', 'Бакалея 🛒', 'упаковка', 12, 12, 360, NOW(), NOW()),
    (19, 'Повидло', 'шт', 'Бакалея 🛒', 'упаковка', 8, 8, 256, NOW(), NOW()),
    (20, 'Икра кабачковая', 'шт', 'Бакалея 🛒', 'упаковка', 8, 8, 256, NOW(), NOW()),
    (21, 'Масло растительное', 'л', 'Бакалея 🛒', 'упаковка', 15, 15, 180, NOW(), NOW()),
    (22, 'Кукуруза конс.', 'шт', 'Бакалея 🛒', 'упаковка', 12, 12, 360, NOW(), NOW()),
    (23, 'Томатная паста', 'шт', 'Бакалея 🛒', 'упаковка', 6, 6, 96, NOW(), NOW()),
    (24, 'Печенье', 'шт', 'Бакалея 🛒', 'упаковка', 5, 5, 40, NOW(), NOW());
/*!40000 ALTER TABLE `Ingredients` ENABLE KEYS */;

-- Дамп структуры для таблица kaseevzk_forms.Menus
DROP TABLE IF EXISTS `Menus`;
CREATE TABLE IF NOT EXISTS `Menus` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `is_template` tinyint(1) DEFAULT '0',
  `owner_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Дамп данных таблицы kaseevzk_forms.Menus: ~2 rows (приблизительно)
/*!40000 ALTER TABLE `Menus` DISABLE KEYS */;
INSERT INTO `Menus` (`id`, `name`, `is_template`, `owner_id`, `created_at`, `updated_at`) VALUES
    (1, 'Шаблон по умолчанию', 1, NULL, NOW(), NOW()),
    (2, 'Завтрак на неделю', 1, NULL, NOW(), NOW());
/*!40000 ALTER TABLE `Menus` ENABLE KEYS */;

-- Дамп структуры для таблица kaseevzk_forms.MenuItems
DROP TABLE IF EXISTS `MenuItems`;
CREATE TABLE IF NOT EXISTS `MenuItems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `menu_id` int(11) NOT NULL,
  `ingredient_id` int(11) NOT NULL,
  `required_amount` float NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Дамп данных таблицы kaseevzk_forms.MenuItems: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `MenuItems` DISABLE KEYS */;
/*!40000 ALTER TABLE `MenuItems` ENABLE KEYS */;

-- Дамп структуры для таблица kaseevzk_forms.Users
DROP TABLE IF EXISTS `Users`;
CREATE TABLE IF NOT EXISTS `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_id` varchar(50) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `role` varchar(50) DEFAULT 'user',
  `is_registered` tinyint(1) DEFAULT '0',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telegram_id` (`telegram_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4;

-- Дамп данных таблицы kaseevzk_forms.Users: ~2 rows (приблизительно)
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` (`id`, `telegram_id`, `username`, `first_name`, `last_name`, `role`, `is_registered`, `created_at`, `updated_at`) VALUES
    (1, '7810185577', 'admin', 'Админ', 'Бота', 'admin', 1, NOW(), NOW()),
    (2, '123456789', 'user123', 'Иван', 'Иванов', 'user', 1, NOW(), NOW());
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;

-- Дамп структуры для таблица kaseevzk_forms.UserStates
DROP TABLE IF EXISTS `UserStates`;
CREATE TABLE IF NOT EXISTS `UserStates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `telegram_id` varchar(50) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `current_menu_id` int(11) DEFAULT NULL,
  `editing_ingredient_id` int(11) DEFAULT NULL,
  `step` varchar(255) DEFAULT NULL,
  `notification_time` varchar(10) DEFAULT '09:00',
  `current_order` json DEFAULT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `telegram_id` (`telegram_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Дамп данных таблицы kaseevzk_forms.UserStates: ~0 rows (приблизительно)
/*!40000 ALTER TABLE `UserStates` DISABLE KEYS */;
/*!40000 ALTER TABLE `UserStates` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;