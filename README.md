📦 Инструкция по установке и запуску Telegram-бота
1. Установи Node.js
Убедись, что у тебя установлен Node.js (рекомендуется версия 18.x или выше)

🔗 Скачай с официального сайта: https://nodejs.org

```
node -v
npm -v
```

2. Клонируй проект или распакуй
git clone https://github.com/onoot/botyanya-main.git 
cd botyanya-main

3. Установи зависимости
npm install


4. Создай .env файл или переименуйте .env.example
TELEGRAM_BOT_TOKEN=ВАШ_ТОКЕН
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=ingredient_bot

🔒 Токен можно получить от @BotFather в Telegram
🛠 Имя БД должно совпадать с тем, куда ты будешь импортировать SQL-дамп

CREATE DATABASE ingredient_bot;

6. Импортируй дамп ingredient_bot.sql в MySQL v5+
mysql -u root -p ingredient_bot < ingredient_bot.sql

или через phpMyAdmin:

Открой http://localhost/phpmyadmin
Выбери БД ingredient_bot
Нажми «Импорт» → выбери ingredient_bot.sql → загрузи

7. Проверь структуру таблиц

8. Запусти бота
Для разработки с автоперезагрузкой:
npm run dev

Для production-запуска:
npm start

✅ Что произойдёт при запуске
Бот подключится к вашей БД
Прочитает переменные из .env
Синхронизирует модели (не обязательно, если уже есть дамп)
Запустит polling-режим
Начнёт обрабатывать команды /start, /register, /add_ingredient и т.д.
