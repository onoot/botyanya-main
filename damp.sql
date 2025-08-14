-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Хост: localhost
-- Время создания: Авг 14 2025 г., 13:03
-- Версия сервера: 8.0.34-26-beget-1-1
-- Версия PHP: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `kaseevzk_forms`
--

-- --------------------------------------------------------

--
-- Структура таблицы `Ingredients`
--
-- Создание: Авг 14 2025 г., 09:47
-- Последнее обновление: Авг 14 2025 г., 09:47
--

DROP TABLE IF EXISTS `Ingredients`;
CREATE TABLE `Ingredients` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `category` varchar(255) NOT NULL,
  `packaging` varchar(100) DEFAULT NULL,
  `packaging_amount` float DEFAULT '1',
  `min_order` float DEFAULT '1',
  `max_order` float DEFAULT '1000',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Дамп данных таблицы `Ingredients`
--

INSERT INTO `Ingredients` (`id`, `name`, `unit`, `category`, `packaging`, `packaging_amount`, `min_order`, `max_order`, `created_at`, `updated_at`) VALUES
(1, 'Говядина, подгруппа 1.1', 'кг', 'Мясо и печень 🥩', 'коробка', 20, 20, 600, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(2, 'Печень', 'кг', 'Мясо и печень 🥩', 'коробка', 20, 20, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(3, 'Минтай', 'кг', 'Рыба 🐟', 'коробка', 24, 24, 600, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(4, 'Горбуша', 'кг', 'Рыба 🐟', 'коробка', 22, 22, 594, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(5, 'Горох', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(6, 'Пропаренный рис', 'кг', 'Крупы 🌾', 'упаковка', 25, 25, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(7, 'Вермишель', 'кг', 'Крупы 🌾', 'упаковка', 20, 20, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(8, 'Рожки', 'кг', 'Крупы 🌾', 'упаковка', 20, 20, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(9, 'Перловая', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(10, 'Ячневая', 'кг', 'Крупы 🌾', 'упаковка', 40, 40, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(11, 'Манка', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(12, 'Пшеничная', 'кг', 'Крупы 🌾', 'упаковка', 40, 40, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(13, 'Пшено', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(14, 'Овсянка', 'кг', 'Крупы 🌾', 'упаковка', 5, 5, 50, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(15, 'Гречневая', 'кг', 'Крупы 🌾', 'мешок', 50, 50, 200, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(16, 'Зеленый горошек (упаковка 12 шт, 5,04кг)', 'шт', 'Бакалея 🛒', 'упаковка', 12, 12, 360, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(17, 'Повидло (упаковка 8 шт, 5,04кг)', 'шт', 'Бакалея 🛒', 'упаковка', 8, 8, 256, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(18, 'Икра кабачковая (4,08кг)', 'шт', 'Бакалея 🛒', 'упаковка', 8, 8, 256, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(19, 'Масло растительное (упаковка 15 шт, 15л)', 'л', 'Бакалея 🛒', 'упаковка', 15, 15, 180, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(20, 'Кукуруза конс. (упаковка 12 шт, 4,5кг)', 'шт', 'Бакалея 🛒', 'упаковка', 12, 12, 360, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(21, 'Томатная паста (упаковка 6 шт, 6кг)', 'шт', 'Бакалея 🛒', 'упаковка', 6, 6, 96, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(22, 'Печенье (упаковка 5кг)', 'шт', 'Бакалея 🛒', 'упаковка', 5, 5, 40, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(23, 'Пряники (упаковка 3кг)', 'шт', 'Бакалея 🛒', 'упаковка', 1, 1, 30, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(24, 'Дрожжи сухие (шт. 0,1кг)', 'шт', 'Бакалея 🛒', 'упаковка', 1, 1, 30, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(25, 'Ванилин (шт. 0,0015кг)', 'шт', 'Бакалея 🛒', 'упаковка', 1, 1, 30, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(26, 'Чай (шт. 0,5кг)', 'шт', 'Бакалея 🛒', 'упаковка', 1, 1, 30, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(27, 'Какао (шт. 0,1кг)', 'шт', 'Бакалея 🛒', 'упаковка', 1, 1, 30, '2025-08-14 12:47:50', '2025-08-14 12:47:50'),
(28, 'Кофейный напиток (шт. 0,1кг)', 'шт', 'Бакалея 🛒', 'упаковка', 1, 1, 30, '2025-08-14 12:47:50', '2025-08-14 12:47:50');

-- --------------------------------------------------------

--
-- Структура таблицы `MenuItems`
--
-- Создание: Авг 14 2025 г., 09:49
--

DROP TABLE IF EXISTS `MenuItems`;
CREATE TABLE `MenuItems` (
  `id` int NOT NULL,
  `ingredient_id` json NOT NULL,
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `Menus`
--
-- Создание: Авг 14 2025 г., 09:49
--

DROP TABLE IF EXISTS `Menus`;
CREATE TABLE `Menus` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `comment` text COLLATE utf8mb4_unicode_ci,
  `is_template` int DEFAULT NULL,
  `owner_id` int NOT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `Users`
--
-- Создание: Авг 14 2025 г., 10:03
--

DROP TABLE IF EXISTS `Users`;
CREATE TABLE `Users` (
  `id` int NOT NULL,
  `telegram_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `organisation` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `is_registered` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Структура таблицы `UserStates`
--
-- Создание: Авг 14 2025 г., 10:03
--

DROP TABLE IF EXISTS `UserStates`;
CREATE TABLE `UserStates` (
  `id` int NOT NULL,
  `telegram_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `current_menu_id` int DEFAULT NULL,
  `editing_ingredient_id` int DEFAULT NULL,
  `step` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `notification_time` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT '09:00',
  `current_order` json DEFAULT NULL,
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_bot_message_id` int DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `Ingredients`
--
ALTER TABLE `Ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Индексы таблицы `MenuItems`
--
ALTER TABLE `MenuItems`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `Menus`
--
ALTER TABLE `Menus`
  ADD PRIMARY KEY (`id`);

--
-- Индексы таблицы `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telegram_id` (`telegram_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Индексы таблицы `UserStates`
--
ALTER TABLE `UserStates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telegram_id` (`telegram_id`);

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `Ingredients`
--
ALTER TABLE `Ingredients`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT для таблицы `MenuItems`
--
ALTER TABLE `MenuItems`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `Menus`
--
ALTER TABLE `Menus`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT для таблицы `UserStates`
--
ALTER TABLE `UserStates`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
