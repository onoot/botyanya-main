// controllers/adminController.mjs
import db from '../models/index.mjs';
import { deleteMessage } from '../utils/botUtils.mjs';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from'path';

const ITEMS_PER_PAGE = 10;

export const exportOrdersByCategory = async (bot, chatId) => {
  try {
    // Получаем уникальные категории
    const categories = await db.Ingredient.findAll({
      attributes: ['category'],
      group: ['category'],
      raw: true
    });
    console.log(JSON.stringify(categories))

    if (!categories.length) {
      return bot.sendMessage(chatId, "❌ Категории не найдены.");
    }

    const keyboard = categories.map(cat => [{
      text: cat.category,
      callback_data: `exp_cat_${cat.category}`
    }]);

    keyboard.push([{ text: '❌ Отмена', callback_data: 'admin_back_to_menu' }]);

    await bot.sendMessage(chatId, "📂 Выберите категорию:", {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка при выборе категории:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить категории.");
  }
};

export const handleExportCategory = async (bot, query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    // 1. Извлекаем категорию
    const match = data.match(/exp_cat_(.+)/);
    if (!match) {
      return bot.answerCallbackQuery(query.id, "❌ Категория не найдена", true);
    }

    const category = match[1];

    // 2. Проверяем существование категории
    const dbCat = await db.Ingredient.findOne({
      where: { category },
      attributes: ['category'],
      raw: true
    });

    if (!dbCat) {
      return bot.sendMessage(chatId, `❌ Категория "${category}" не найдена.`);
    }

    // 3. Получаем ингредиенты категории
    const ingredients = await db.Ingredient.findAll({
      where: { category },
      raw: true
    });

    if (ingredients.length === 0) {
      return bot.sendMessage(chatId, `❌ Нет ингредиентов в категории "${category}".`);
    }

    // 4. Получаем все заказы и элементы заказов
    const menus = await db.Menu.findAll();
    const menuItems = await db.MenuItem.findAll();

    const exportData = [];

    // Обрабатываем каждый заказ
    for (const menu of menus) {
      // Находим соответствующий элемент заказа
      const menuItem = menuItems.find(item => item.id === menu.is_template);
      if (!menuItem) continue;

      const ingredientItems = menuItem.ingredientId;
      
      // Проверяем, что это массив
      if (!Array.isArray(ingredientItems)) continue;

      // Обрабатываем каждый ингредиент в заказе
      for (const ingItem of ingredientItems) {
        if (!ingItem?.id || ingItem.quantity == null) continue;

        const ingredient = ingredients.find(ing => ing.id === ingItem.id);
        if (!ingredient) continue;

        const user = await db.User.findByPk(menu.ownerId, { raw: true });

        exportData.push({
          Заказ: menu.name,
          Организация: user?.organisation || 'Не указана',
          Пользователь: user?.firstName || 'Пользователь',
          Продукт: ingredient.name,
          Количество: ingItem.quantity,
          Ед: ingredient.unit,
          Фасовка: ingredient.packaging,
          "Кол-во в упаковке": ingredient.packaging_amount,
          Комментарий: menu.comment || '',
          Дата: new Date(menu.createdAt).toLocaleString('ru-RU')
        });
      }
    }

    // Если нет данных для выгрузки
    if (exportData.length === 0) {
      return bot.sendMessage(chatId, `📦 Нет заказов с продуктами из категории "${category}".`);
    }

    // Создаем Excel файл
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(category.slice(0, 31), {
      views: [{ state: 'frozen', ySplit: 1 }]
    });

    // Настраиваем колонки таблицы
    worksheet.columns = [
      { header: 'Заказ', key: 'Заказ', width: 20 },
      { header: 'Организация', key: 'Организация', width: 25 },
      { header: 'Пользователь', key: 'Пользователь', width: 20 },
      { header: 'Продукт', key: 'Продукт', width: 30 },
      { header: 'Кол-во', key: 'Количество', width: 10 },
      { header: 'Ед.', key: 'Ед', width: 8 },
      { header: 'Фасовка', key: 'Фасовка', width: 15 },
      { header: 'В упаковке', key: 'Кол-во в упаковке', width: 15 },
      { header: 'Комментарий', key: 'Комментарий', width: 30 },
      { header: 'Дата', key: 'Дата', width: 18 }
    ];

    // Добавляем данные в таблицу
    worksheet.addRows(exportData);
    
    // Делаем заголовок жирным и с фоном
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEEEEEE' }
    };

    // Генерируем буфер Excel файла
    let buffer;
    try {
      buffer = await workbook.xlsx.writeBuffer();
    } catch (writeErr) {
      console.error("Ошибка генерации Excel:", writeErr);
      return bot.sendMessage(chatId, "❌ Не удалось создать файл Excel.");
    }

    // Создаем временный каталог
    const tempDir = path.join('./', '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Определяем dateStr перед использованием
    const dateStr = new Date().toLocaleDateString('ru-RU');
    
    // Создаем безопасное имя файла
    const safeCategory = category
      .replace(/[^a-zA-Z0-9а-яА-Я]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    
    const filename = `Zakazy_${safeCategory}_${dateStr.replace(/\./g, '-')}.xlsx`;
    const filePath = path.join(tempDir, filename);

    // Записываем буфер в файл
    fs.writeFileSync(filePath, buffer);

    // Проверяем, что файл создан
    if (!fs.existsSync(filePath)) {
      console.error("Файл не был сохранен");
      return bot.sendMessage(chatId, "❌ Не удалось сохранить файл.");
    }

    // Отправляем файл из системы
    try {
      await bot.sendDocument(
        chatId,
        { source: fs.createReadStream(filePath), filename: filename },
        {
          caption: `✅ Выгрузка всех заказов\nКатегория: "${category}"\nСтрок: ${exportData.length}`
        }
      );
    } catch (sendErr) {
      console.error("Ошибка отправки в Telegram:", sendErr);
      await bot.sendMessage(chatId, "❌ Не удалось отправить файл. Ошибка Telegram API.");
    } finally {
      // Удаляем временный файл
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error("Ошибка удаления временного файла:", unlinkErr);
      }
    }

  } catch (err) {
    console.error("Ошибка выгрузки:", err);
    await bot.sendMessage(chatId, "❌ Не удалось создать выгрузку.");
  }
};

// Главная админ-панель
export const showAdminPanel = async (bot, chatId) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '➕ Добавить ингредиент', callback_data: 'admin_add_ingredient' }],
        [{ text: '❌ Удалить ингредиент', callback_data: 'admin_delete_ingredient' }],
        [{ text: '📊 Выгрузить заказы по категориям', callback_data: 'admin_export_orders' }],
        [{ text: '🕒 Настроить время', callback_data: 'admin_set_notification_time' }],
        [{ text: '📢 Сделать рассылку', callback_data: 'admin_send_broadcast' }],
        [{ text: '🗑 Удалить пользователя', callback_data: 'admin_delete_user' }]
      ]
    }
  };

  await bot.sendMessage(chatId, "🛠 Админ-панель", keyboard);
};

// Показать список ингредиентов с пагинацией
export const showIngredients = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  // Определяем страницу
  const match = query.data.match(/admin_ingredient_(prev|next)_page_(\d+)/);
  const direction = match ? match[1] : 'next';
  const currentPage = match ? parseInt(match[2], 10) : 0;

  const offset = direction === 'prev' ? Math.max(0, currentPage - 1) * ITEMS_PER_PAGE : currentPage * ITEMS_PER_PAGE;

  try {
    const result = await db.Ingredient.findAndCountAll({
      limit: ITEMS_PER_PAGE,
      offset: offset,
      raw: true
    });

    const totalPages = Math.ceil(result.count / ITEMS_PER_PAGE);

    const keyboard = result.rows.map(ingredient => [{
      text: `${ingredient.name} (${ingredient.category})`,
      callback_data: `admin_select_ingredient_${ingredient.id}`
    }]);

    // Пагинация
    const paginationRow = [];
    if (offset > 0) {
      paginationRow.push({
        text: '⬅️ Назад',
        callback_data: `admin_ingredient_prev_page_${Math.max(0, currentPage - 1)}`
      });
    }
    if (offset + ITEMS_PER_PAGE < result.count) {
      paginationRow.push({
        text: 'Вперёд ➡️',
        callback_data: `admin_ingredient_next_page_${currentPage + 1}`
      });
    }

    if (paginationRow.length > 0) {
      keyboard.push(paginationRow);
    }

    // Кнопка "Назад в меню"
    keyboard.push([{ text: '⬅️ Назад', callback_data: 'admin_back_to_menu' }]);

    const messageText = `🔍 Ингредиенты (${offset + 1}-${Math.min(offset + ITEMS_PER_PAGE, result.count)} из ${result.count}):`;

    await deleteMessage(bot, chatId, message_id);
    await bot.sendMessage(chatId, messageText, {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка отображения ингредиентов:", err);
    await bot.sendMessage(chatId, "❌ Ошибка загрузки ингредиентов.");
  }
};

// Удаление ингредиента
export const deleteIngredient = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  const match = query.data.match(/admin_select_ingredient_(\d+)/);
  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Ингредиент не найден", true);
  }

  const ingredientId = parseInt(match[1], 10);
  const ingredient = await db.Ingredient.findByPk(ingredientId);

  if (!ingredient) {
    return bot.sendMessage(chatId, "❌ Ингредиент не найден.");
  }

  const confirmKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✅ Да',
            callback_data: `admin_confirm_delete_ingredient_${ingredientId}`
          },
          {
            text: '❌ Нет',
            callback_data: 'admin_delete_ingredient'
          }
        ]
      ]
    }
  };

  await deleteMessage(bot, chatId, message_id);
  await bot.sendMessage(chatId, `Вы действительно хотите удалить ингредиент "${ingredient.name}"?`, confirmKeyboard);
};

// Подтверждение удаления
export const confirmDeleteIngredient = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  const match = query.data.match(/admin_confirm_delete_ingredient_(\d+)/);
  const ingredientId = parseInt(match[1], 10);

  const ingredient = await db.Ingredient.findByPk(ingredientId);
  if (!ingredient) {
    return bot.sendMessage(chatId, "❌ Ингредиент не найден.");
  }

  await ingredient.destroy();
  await deleteMessage(bot, chatId, message_id);
  await bot.sendMessage(chatId, `✅ Ингредиент "${ingredient.name}" удалён.`);
  await showIngredients(bot, query);
};

// Добавление ингредиента
export const addIngredient = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const args = text.split(' ').slice(1);

  if (args.length < 6) {
    await bot.sendMessage(chatId, "Используйте: /add_ingredient имя единица_измерения категория фасовка_количество мин_заказ макс_заказ");
    return;
  }

  const [name, unit, category, packaging_amount, min_order, max_order] = args;
  const packaging = 'шт'; // Можно улучшить: передавать в команде

  try {
    await db.Ingredient.create({
      name,
      unit,
      category,
      packaging,
      packaging_amount: parseFloat(packaging_amount),
      min_order: parseFloat(min_order),
      max_order: parseFloat(max_order)
    });

    await bot.sendMessage(chatId, `✅ Ингредиент "${name}" добавлен.`);
  } catch (err) {
    console.error("Ошибка добавления ингредиента:", err);
    await bot.sendMessage(chatId, "❌ Не удалось добавить ингредиент.");
  }
};

// Перемещение ингредиента в другую категорию
export const moveIngredientToCategory = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const args = text.split(' ').slice(1);

  if (args.length < 2) {
    await bot.sendMessage(chatId, "Используйте: /move_ingredient имя_ингредиента новая_категория");
    return;
  }

  const [name, newCategory] = args;
  try {
    const ingredient = await db.Ingredient.findOne({ where: { name } });
    if (!ingredient) {
      return bot.sendMessage(chatId, "❌ Ингредиент не найден.");
    }

    await ingredient.update({ category: newCategory });
    await bot.sendMessage(chatId, `✅ Ингредиент "${name}" перемещён в категорию "${newCategory}".`);
  } catch (err) {
    console.error("Ошибка перемещения ингредиента:", err);
    await bot.sendMessage(chatId, "❌ Не удалось переместить ингредиент.");
  }
};

// Список шаблонов
export const listTemplates = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  try {
    const templates = await db.Menu.findAll({ where: { isTemplate: true }, raw: true });

    if (!templates.length) {
      return bot.sendMessage(chatId, "🍽 Шаблоны отсутствуют.");
    }

    const keyboard = templates.map(template => [{
      text: template.name || `Шаблон #${template.id}`,
      callback_data: `use_template_${template.id}`
    }]);

    keyboard.push([{ text: '⬅️ Назад', callback_data: 'admin_back_to_menu' }]);

    await deleteMessage(bot, chatId, message_id);
    await bot.sendMessage(chatId, "🧾 Список шаблонов:", {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка вывода шаблонов:", err);
    await bot.sendMessage(chatId, "❌ Ошибка загрузки шаблонов.");
  }
};

// Настройка времени рассылки
export const setNotificationTime = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '09:00', callback_data: 'admin_set_time_09:00' }],
        [{ text: '10:00', callback_data: 'admin_set_time_10:00' }],
        [{ text: '11:00', callback_data: 'admin_set_time_11:00' }],
        [{ text: '12:00', callback_data: 'admin_set_time_12:00' }],
        [{ text: '⬅️ Назад', callback_data: 'admin_back_to_menu' }]
      ]
    }
  };

  await deleteMessage(bot, chatId, message_id);
  await bot.sendMessage(chatId, "🕒 Выберите время ежедневной рассылки:", keyboard);
};

// Обработка выбора времени
export const handleSetTime = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const match = query.data.match(/admin_set_time_(\d{2}:\d{2})/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Неверное время", true);
  }

  const selectedTime = match[1];

  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    if (!state) {
      return bot.sendMessage(chatId, "❌ Не удалось найти состояние пользователя.");
    }

    await state.update({ notificationTime: selectedTime });

    await deleteMessage(bot, chatId, message_id);
    await bot.sendMessage(chatId, `✅ Время ежедневной рассылки установлено: ${selectedTime}`);
    await showAdminPanel(bot, chatId);

  } catch (err) {
    console.error("Ошибка установки времени:", err);
    await bot.sendMessage(chatId, "❌ Не удалось установить время.");
  }
};

// Рассылка сообщения
export const broadcastMessage = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    await state.update({ step: 'broadcast' });

    await deleteMessage(bot, chatId, message_id);
    await bot.sendMessage(chatId, "📢 Введите сообщение для рассылки:");

  } catch (err) {
    console.error("Ошибка при начале рассылки:", err);
    await bot.sendMessage(chatId, "❌ Не удалось начать рассылку.");
  }
};

// Удаление пользователя
export const deleteUser = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = text.split(' ')[1];

  if (!username) {
    return bot.sendMessage(chatId, "Используйте: /delete_user username");
  }

  try {
    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return bot.sendMessage(chatId, "❌ Пользователь не найден.");
    }

    await user.destroy();
    await bot.sendMessage(chatId, `✅ Пользователь @${username} удалён.`);
  } catch (err) {
    console.error("Ошибка удаления пользователя:", err);
    await bot.sendMessage(chatId, "❌ Не удалось удалить пользователя.");
  }
};