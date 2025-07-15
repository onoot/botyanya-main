-- phpMyAdmin SQL Dump
-- version 5.0.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jul 16, 2025 at 12:06 AM
-- Server version: 5.7.29-log
-- PHP Version: 8.0.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ingredient_bot`
--

-- --------------------------------------------------------

--
-- Table structure for table `ingredient`
--

CREATE TABLE `ingredient` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

CREATE TABLE `ingredients` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `unit` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `category` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`id`, `name`, `unit`, `category`, `created_at`, `updated_at`) VALUES
(373, 'Пшеничная мука', 'кг', 'Мучное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(374, 'Ржаная мука', 'кг', 'Мучное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(375, 'Крахмал', 'кг', 'Мучное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(376, 'Макароны', 'кг', 'Мучное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(377, 'Вермишель', 'кг', 'Мучное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(378, 'Сахар', 'кг', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(379, 'Мёд', 'л', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(380, 'Шоколад', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(381, 'Джем', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(382, 'Сахарная пудра', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(383, 'Яйца', 'шт', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(384, 'Молоко', 'л', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(385, 'Сливки', 'мл', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(386, 'Творог', 'г', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(387, 'Сметана', 'г', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(388, 'Говядина', 'кг', 'Мясо', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(389, 'Свинина', 'кг', 'Мясо', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(390, 'Курица', 'кг', 'Мясо', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(391, 'Бекон', 'г', 'Мясо', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(392, 'Колбаса', 'г', 'Мясо', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(393, 'Картофель', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(394, 'Морковь', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(395, 'Лук', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(396, 'Перец болгарский', 'шт', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(397, 'Чеснок', 'г', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(398, 'Помидоры', 'шт', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(399, 'Бананы', 'шт', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(400, 'Яблоки', 'кг', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(401, 'Апельсины', 'шт', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(402, 'Рис', 'кг', 'Крупы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(403, 'Гречка', 'кг', 'Крупы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(404, 'Овсянка', 'кг', 'Крупы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(405, 'Перловка', 'кг', 'Крупы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(406, 'Киноа', 'кг', 'Крупы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(407, 'Подсолнечное масло', 'л', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(408, 'Оливковое масло', 'л', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(409, 'Сливочное масло', 'г', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(410, 'Майонез', 'г', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(411, 'Маргарин', 'г', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(412, 'Хлеб', 'шт', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(413, 'Батон', 'шт', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(414, 'Булочки', 'шт', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(415, 'Тосты', 'шт', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(416, 'Пирожные', 'шт', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(417, 'Кофе', 'г', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(418, 'Чай чёрный', 'г', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(419, 'Чай зелёный', 'г', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(420, 'Сок апельсиновый', 'л', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(421, 'Минеральная вода', 'л', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(422, 'Картофель фри', 'г', 'Заморозка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(423, 'Овощи замороженные', 'кг', 'Заморозка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(424, 'Пельмени', 'кг', 'Заморозка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(425, 'Морепродукты', 'кг', 'Заморозка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(426, 'Фрукты замороженные', 'кг', 'Заморозка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(427, 'Соль', 'г', 'Приправы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(428, 'Перец чёрный', 'г', 'Приправы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(429, 'Лавровый лист', 'шт', 'Приправы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(430, 'Уксус', 'мл', 'Приправы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(431, 'Чесночный порошок', 'г', 'Приправы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(432, 'Горох', 'кг', 'Бобовые', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(433, 'Фасоль белая', 'кг', 'Бобовые', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(434, 'Фасоль красная', 'кг', 'Бобовые', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(435, 'Чечевица', 'кг', 'Бобовые', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(436, 'Нут', 'кг', 'Бобовые', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(437, 'Греческий йогурт', 'г', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(438, 'Йогурт натуральный', 'г', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(439, 'Кефир', 'л', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(440, 'Сыр твёрдый', 'г', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(441, 'Сыр мягкий', 'г', 'Молочные', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(442, 'Кола', 'л', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(443, 'Лимонад', 'л', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(444, 'Энергетик', 'мл', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(445, 'Сок яблочный', 'л', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(446, 'Сок томатный', 'мл', 'Напитки', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(447, 'Кукуруза', 'г', 'Консервы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(448, 'Огурцы маринованные', 'банка', 'Консервы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(449, 'Тушёнка', 'банка', 'Консервы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(450, 'Фасоль консервированная', 'банка', 'Консервы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(451, 'Ананасы консервированные', 'банка', 'Консервы', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(452, 'Рыба солёная', 'г', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(453, 'Рыба копчёная', 'г', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(454, 'Сёмга', 'кг', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(455, 'Креветки', 'г', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(456, 'Мидии', 'г', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(457, 'Конфеты шоколадные', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(458, 'Мармелад', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(459, 'Печенье', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(460, 'Шоколад молочный', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(461, 'Шоколад тёмный', 'г', 'Сладкое', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(462, 'Капуста', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(463, 'Свёкла', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(464, 'Тыква', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(465, 'Кабачки', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(466, 'Баклажаны', 'кг', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(467, 'Клубника', 'кг', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(468, 'Малина', 'кг', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(469, 'Ежевика', 'кг', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(470, 'Черника', 'г', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(471, 'Киви', 'шт', 'Фрукты и ягоды', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(472, 'Сало', 'г', 'Мясное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(473, 'Колбаса докторская', 'г', 'Мясное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(474, 'Колбаса полукопчёная', 'г', 'Мясное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(475, 'Сосиски', 'шт', 'Мясное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(476, 'Салями', 'г', 'Мясное', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(477, 'Рыба свежая', 'кг', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(478, 'Кальмары', 'г', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(479, 'Лосось', 'г', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(480, 'Крабовые палочки', 'упаковка', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(481, 'Икра лосося', 'г', 'Морепродукты', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(482, 'Растительное масло', 'л', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(483, 'Майонез домашний', 'мл', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(484, 'Майонез классический', 'мл', 'Жиры', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(485, 'Тесто слоёное', 'г', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(486, 'Тесто дрожжевое', 'г', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(487, 'Тесто песочное', 'г', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(488, 'Тесто безе', 'г', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(489, 'Тесто для пиццы', 'г', 'Выпечка', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(490, 'Салат Айсберг', 'г', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(491, 'Салат Ромен', 'г', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(492, 'Щавель', 'г', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(493, 'Петрушка', 'г', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38'),
(494, 'Укроп', 'г', 'Овощи', '2025-07-16 00:30:38', '2025-07-16 00:30:38');

-- --------------------------------------------------------

--
-- Table structure for table `menu`
--

CREATE TABLE `menu` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_template` tinyint(1) DEFAULT '0',
  `owner_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menuitem`
--

CREATE TABLE `menuitem` (
  `required_amount` float DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ingredient_id` int(11) NOT NULL,
  `menu_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `menuitems`
--

CREATE TABLE `menuitems` (
  `id` int(11) NOT NULL,
  `menu_id` int(11) DEFAULT NULL,
  `ingredient_id` int(11) DEFAULT NULL,
  `required_amount` float DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menuitems`
--

INSERT INTO `menuitems` (`id`, `menu_id`, `ingredient_id`, `required_amount`, `created_at`, `updated_at`) VALUES
(1, 1, 463, 50, '2025-07-15 17:49:56', '2025-07-15 17:49:56'),
(2, 14, 466, 1, '2025-07-15 18:13:06', '2025-07-15 18:13:06');

-- --------------------------------------------------------

--
-- Table structure for table `menus`
--

CREATE TABLE `menus` (
  `id` int(11) NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_template` tinyint(1) DEFAULT '0',
  `owner_id` int(11) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `menus`
--

INSERT INTO `menus` (`id`, `name`, `is_template`, `owner_id`, `created_at`, `updated_at`) VALUES
(2, 'Привет', 1, NULL, '2025-07-15 16:21:28', '2025-07-15 16:21:28'),
(3, 'Привет', 1, NULL, '2025-07-15 16:26:20', '2025-07-15 16:26:20'),
(4, 'Привет (ваша копия)', 0, 2, '2025-07-15 17:52:18', '2025-07-15 17:52:18'),
(12, 'Привет (ваша копия)', 0, NULL, '2025-07-15 18:10:16', '2025-07-15 18:10:16'),
(13, 'Привет (ваша копия)', 0, NULL, '2025-07-15 18:10:18', '2025-07-15 18:10:18'),
(14, 'Привет (ваша копия)', 0, NULL, '2025-07-15 18:12:57', '2025-07-15 18:12:57'),
(15, 'Привет (ваша копия)', 0, NULL, '2025-07-15 18:13:12', '2025-07-15 18:13:12'),
(16, 'Привет (ваша копия)', 0, NULL, '2025-07-15 18:59:37', '2025-07-15 18:59:37'),
(17, 'Привет (ваша копия)', 0, NULL, '2025-07-15 20:22:41', '2025-07-15 20:22:41');

-- --------------------------------------------------------

--
-- Table structure for table `order`
--

CREATE TABLE `order` (
  `id` int(11) NOT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `menu_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orderitem`
--

CREATE TABLE `orderitem` (
  `id` int(11) NOT NULL,
  `amount` float DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `ingredient_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orderitems`
--

CREATE TABLE `orderitems` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `menu_id` int(11) DEFAULT NULL,
  `submitted_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `menu_id`, `submitted_at`, `created_at`, `updated_at`) VALUES
(1, NULL, 1, '2025-07-15 16:56:05', '2025-07-15 16:56:05', '2025-07-15 16:56:05'),
(2, NULL, 1, '2025-07-15 17:50:02', '2025-07-15 17:50:02', '2025-07-15 17:50:02'),
(3, NULL, 14, '2025-07-15 18:13:08', '2025-07-15 18:13:08', '2025-07-15 18:13:08');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `telegram_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_registered` tinyint(1) DEFAULT '0',
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `telegram_id`, `first_name`, `last_name`, `username`, `is_registered`, `role`, `created_at`, `updated_at`) VALUES
(2, '7810185577', 'Try', '', 'try_bly', 1, 'admin', '2025-07-03 05:48:44', '2025-07-03 05:48:50');

-- --------------------------------------------------------

--
-- Table structure for table `usermenu`
--

CREATE TABLE `usermenu` (
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  `user_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `telegram_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `first_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_registered` tinyint(1) DEFAULT '0',
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `telegram_id`, `first_name`, `last_name`, `username`, `is_registered`, `role`, `created_at`, `updated_at`) VALUES
(1, '1148770814', 'overlamer', 'Broken😼', 'Crazy_santa', 1, 'user', '2025-07-15 07:50:13', '2025-07-15 16:21:16'),
(4, '7810185577', 'Try', '', 'try_bly', 1, 'admin', '2025-07-15 19:26:34', '2025-07-15 19:26:34');

-- --------------------------------------------------------

--
-- Table structure for table `userstates`
--

CREATE TABLE `userstates` (
  `id` int(11) NOT NULL,
  `telegram_id` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `current_menu_id` int(11) DEFAULT NULL,
  `editing_ingredient_id` int(11) DEFAULT NULL,
  `step` varchar(255) DEFAULT NULL,
  `notification_time` varchar(10) DEFAULT '09:00',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `userstates`
--

INSERT INTO `userstates` (`id`, `telegram_id`, `user_id`, `current_menu_id`, `editing_ingredient_id`, `step`, `notification_time`, `created_at`, `updated_at`) VALUES
(1, '1148770814', NULL, 17, NULL, NULL, '09:00', '2025-07-15 20:22:41', '2025-07-15 20:22:41'),
(2, '7810185577', NULL, NULL, NULL, NULL, '09:00', '2025-07-15 20:45:09', '2025-07-15 21:02:45');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ingredient`
--
ALTER TABLE `ingredient`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `menu`
--
ALTER TABLE `menu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `menuitem`
--
ALTER TABLE `menuitem`
  ADD PRIMARY KEY (`ingredient_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `menuitems`
--
ALTER TABLE `menuitems`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `menus`
--
ALTER TABLE `menus`
  ADD PRIMARY KEY (`id`),
  ADD KEY `owner_id` (`owner_id`);

--
-- Indexes for table `order`
--
ALTER TABLE `order`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ingredient_id` (`ingredient_id`),
  ADD KEY `order_id` (`order_id`);

--
-- Indexes for table `orderitems`
--
ALTER TABLE `orderitems`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telegram_id` (`telegram_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `usermenu`
--
ALTER TABLE `usermenu`
  ADD PRIMARY KEY (`user_id`,`menu_id`),
  ADD KEY `menu_id` (`menu_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telegram_id` (`telegram_id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `userstates`
--
ALTER TABLE `userstates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `telegram_id` (`telegram_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ingredient`
--
ALTER TABLE `ingredient`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=495;

--
-- AUTO_INCREMENT for table `menu`
--
ALTER TABLE `menu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `menuitems`
--
ALTER TABLE `menuitems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `menus`
--
ALTER TABLE `menus`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `order`
--
ALTER TABLE `order`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orderitem`
--
ALTER TABLE `orderitem`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orderitems`
--
ALTER TABLE `orderitems`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `userstates`
--
ALTER TABLE `userstates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `menu`
--
ALTER TABLE `menu`
  ADD CONSTRAINT `menu_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `menuitem`
--
ALTER TABLE `menuitem`
  ADD CONSTRAINT `menuitem_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `menuitem_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `menus`
--
ALTER TABLE `menus`
  ADD CONSTRAINT `menus_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order`
--
ALTER TABLE `order`
  ADD CONSTRAINT `order_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `order_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menu` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `orderitem`
--
ALTER TABLE `orderitem`
  ADD CONSTRAINT `orderitem_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orderitem_ibfk_2` FOREIGN KEY (`order_id`) REFERENCES `order` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `usermenu`
--
ALTER TABLE `usermenu`
  ADD CONSTRAINT `usermenu_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `usermenu_ibfk_2` FOREIGN KEY (`menu_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
