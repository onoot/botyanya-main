import db from '../models/index.mjs';
import { deleteMessage } from '../utils/botUtils.mjs';
import { scheduleJob } from 'node-schedule';
import {sendDailyMenuToUser} from '../services/menuService.mjs'


const ITEMS_PER_PAGE = 10;

export const setNotificationTime = async (bot, chatId) => {
  const userStates = await db.UserState.findAll({ raw: true });

    const keyboard = {
        reply_markup: {
            inline_keyboard: [
                [{ text: '🕒 09:00', callback_data: 'admin_set_time_09:00' }],
                [{ text: '🕓 10:00', callback_data: 'admin_set_time_10:00' }],
                [{ text: '🕚 11:00', callback_data: 'admin_set_time_11:00' }],
                [{ text: '⬅️ Назад', callback_data: 'admin_back_to_menu' }]
            ]
        }
}
    await bot.sendMessage(
      chatId,
      "🕒 Выберите время ежедневной рассылки:",
      keyboard
    );
};

export const sendTestMenu = async (bot, chatId) => {
  await sendDailyMenuToUser(bot, chatId); 
};
export const showAdminPanel = async (bot, chatId) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '➕ Добавить ингредиент', callback_data: 'admin_add_ingredient' }],
        [{ text: '❌ Удалить ингредиент', callback_data: 'admin_delete_ingredient' }],
        [{ text: '📂 Переместить в категорию', callback_data: 'admin_move_ingredient' }],
        [{ text: '🧾 Список шаблонов', callback_data: 'admin_list_templates' }],
        [{ text: '🕒 Настроить время рассылки', callback_data: 'admin_set_notification_time' }],
        [{ text: '📢 Сделать рассылку всем', callback_data: 'admin_send_broadcast' }],
        [{ text: '🗑 Удалить пользователя', callback_data: 'admin_delete_user' }]
      ]
    }
  };

  await bot.sendMessage(chatId, '🛠 Админ-панель:', keyboard);
};
// Вывод списка ингредиентов с возможностью удаления
export const showIngredients = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  try {
    const ingredients = await db.Ingredient.findAll({ raw: true });

    const keyboard = ingredients.map(ingredient => [{
      text: `${ingredient.name} (${ingredient.category})`,
      callback_data: `admin_select_ingredient_${ingredient.id}`
    }]);

    keyboard.push([{ text: '⬅️ Назад', callback_data: 'admin_back_to_menu' }]);

    // ✅ ПРАВИЛЬНЫЙ ВЫЗОВ editMessageText
    await bot.editMessageText(
      "🔍 Ингредиенты:",
      chatId,
      message_id,
      { reply_markup: { inline_keyboard: keyboard } }
    );

  } catch (err) {
    console.error("Ошибка отображения ингредиентов:", err);
    await bot.sendMessage(chatId, "❌ Ошибка загрузки ингредиентов.");
  }
};

export const handleSetTime = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const match = query.data.match(/admin_set_time_(\d{2}:\d{2})/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Неверное время", true);
  }

  const selectedTime = match[1];

  try {
      const [state, created] = await db.UserState.findOrCreate({
          where: { telegramId: chatId.toString() },
          defaults: {
              currentMenuId: null,
              editingIngredientId: null,
              step: 'initial',
              notificationTime: '09:00'
          }
      });

      if (!created) {
      // Если состояние уже существует — просто обновим нужные поля при необходимости
      await state.update({ step: 'menu_selection' });
    }
    // Обновляем время рассылки
    await state.update({ notificationTime: selectedTime });

    await bot.sendMessage(chatId, `✅ Время ежедневной рассылки установлено: ${selectedTime}`);

    // Отправляем админа обратно в меню
    await showAdminPanel(bot, chatId);

  } catch (err) {
    console.error("Ошибка установки времени:", err);
    await bot.sendMessage(chatId, "❌ Не удалось установить время.");
  }
};

// Обработчик удаления ингредиента через кнопки
export const deleteIngredient = async (bot, query) => {
  const chatId = query.message.chat.id;
  const match = query.data.match(/admin_select_ingredient_(\d+)/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Неизвестный ID", true);
  }

  const ingredientId = parseInt(match[1], 10);

  try {
    const ingredient = await db.Ingredient.findByPk(ingredientId);
    if (!ingredient) {
      return bot.sendMessage(chatId, "❌ Ингредиент не найден.");
    }

    await ingredient.destroy();
    await bot.sendMessage(chatId, `✅ Ингредиент "${ingredient.name}" удален.`);
    await showIngredients(bot, query);

  } catch (err) {
    console.error("Ошибка удаления ингредиента:", err);
    await bot.sendMessage(chatId, "❌ Не удалось удалить ингредиент.");
  }
};
// Добавлено: показываем список ингредиентов
export const showIngredientList = async (bot, chatId, page = 1) => {
    try {
        const offset = (page - 1) * ITEMS_PER_PAGE;

        // Получаем часть ингредиентов
        const ingredients = await db.Ingredient.findAll({
            order: [['id', 'ASC']],
            limit: ITEMS_PER_PAGE,
            offset
        });

        if (!ingredients.length) {
            bot.sendMessage(chatId, "❌ Ингредиенты отсутствуют");
            return;
        }

        const keyboard = [];

        // Кнопки с ингредиентами
        ingredients.forEach(ingredient => {
            keyboard.push([{
                text: `${ingredient.name} — ${ingredient.category}`,
                callback_datadata: `admin_select_ingredient_${ingredient.id}`
            }]);
        });

        // Пагинация
        const hasNextPage = await db.Ingredient.count({ where: {} }) > page * ITEMS_PER_PAGE;

        const navigationButtons = [];
        if (page > 1) {
            navigationButtons.push({
                text: '⬅️ Назад',
                callback_datadata: `admin_ingredient_prev_page_${page}`
            });
        }

        if (hasNextPage) {
            navigationButtons.push({
                text: '➡️ Вперёд',
                callback_datadata: `admin_ingredient_next_page_${page}`
            });
        }

        if (navigationButtons.length > 0) {
            keyboard.push(navigationButtons);
        }

        // Главная кнопка
        keyboard.push([{ text: '↩️ Назад в меню', callback_datadata: 'admin_back_to_menu' }]);

        await bot.sendMessage(chatId, `🧾 Список ингредиентов (страница ${page})`, {
            reply_markup: { inline_keyboard: keyboard }
        });

    } catch (err) {
        console.error("Ошибка вывода ингредиентов:", err);
        bot.sendMessage(chatId, "❌ Не удалось загрузить список ингредиентов");
    }
};


// Обработка перемещения ингредиента по категории
export const moveIngredientToCategory = async (bot, msg) => {
  const chatId = msg.chat.id;
  const args = msg.text.split(' ');

  if (args.length < 3) {
    return bot.sendMessage(chatId, "Используйте: /move_ingredient имя новая_категория");
  }

  const [_, name, newCategory] = args;

  try {
    const ingredient = await db.Ingredient.findOne({ where: { name } });
    if (!ingredient) {
      return bot.sendMessage(chatId, `❌ Ингредиент "${name}" не найден.`);
    }

    await ingredient.update({ category: newCategory });
    await bot.sendMessage(chatId, `✅ Ингредиент "${name}" перемещен в категорию "${newCategory}".`);

  } catch (err) {
    console.error("Ошибка изменения категории:", err);
    await bot.sendMessage(chatId, "❌ Ошибка изменения категории.");
  }
};

// Удаление пользователя
export const deleteUser = async (bot, msg) => {
  const chatId = msg.chat.id;
  const args = msg.text.split(' ');

  if (args.length < 2) {
    return bot.sendMessage(chatId, "Используйте: /delete_user username");
  }

  const username = args[1].startsWith('@') ? args[1].slice(1) : args[1];

  try {
    const user = await db.User.findOne({ where: { username } });
    if (!user) {
      return bot.sendMessage(chatId, `❌ Пользователь "@${username}" не найден.`);
    }

    await user.destroy();
    await bot.sendMessage(chatId, `✅ Пользователь "@${username}" удален.`);
  } catch (err) {
    console.error("Ошибка удаления пользователя:", err);
    await bot.sendMessage(chatId, "❌ Не удалось удалить пользователя.");
  }
};

// Вывод всех шаблонов
// controllers/adminController.mjs
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

    // ✅ ПРАВИЛЬНЫЙ ВЫЗОВ editMessageText
    await bot.sendMessage(
      chatId,
      "📜 Список шаблонов:",
      { reply_markup: { inline_keyboard: keyboard } }
    );

  } catch (err) {
    console.error("Ошибка вывода шаблонов:", err);
    await bot.sendMessage(chatId, "❌ Ошибка загрузки шаблонов.");
  }
};

export const registerUserCallback = async (bot, query) => {
  const chatId = query.message.chat.id;
  const userData = query.from;

  try {
    const [user, created] = await db.User.findOrCreate({
      where: { username: userData.username },
      defaults: {
        telegramId: userData.id.toString(),
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        role: 'user',
        isRegistered: true
      }
    });

    if (!created) {
      return bot.sendMessage(chatId, "Вы уже зарегистрированы.");
    }

    const state = await db.UserState.upsert({
      telegramId: chatId.toString(),
      step: 'menu_selection'
    });

    await bot.editMessageText(
      `✅ Вы успешно зарегистрированы как клиент, @${userData.username}!\nТеперь вы можете создавать меню и отправлять заявки.`,
      chatId,
      query.message.message_id,
      {
        reply_markup: {
          inline_keyboard: [[{
            text: '🍽 Выбрать шаблон меню',
            callback_data:'select_template'
          }]]
        }
      }
    );

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    await bot.sendMessage(chatId, "❌ Ошибка регистрации.");
  }
};