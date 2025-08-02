// controllers/adminController.mjs
import db from '../models/index.mjs';
import { deleteMessage } from '../utils/botUtils.mjs';

const ITEMS_PER_PAGE = 10;

// Главная админ-панель
export const showAdminPanel = async (bot, chatId) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '➕ Добавить ингредиент', callback_data: 'admin_add_ingredient' }],
        [{ text: '❌ Удалить ингредиент', callback_data: 'admin_delete_ingredient' }],
        [{ text: '🧾 Список шаблонов', callback_data: 'admin_list_templates' }],
        [{ text: '🕒 Настроить время рассылки', callback_data: 'admin_set_notification_time' }],
        [{ text: '📢 Сделать рассылку всем', callback_data: 'admin_send_broadcast' }],
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