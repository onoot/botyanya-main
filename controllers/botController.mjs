// controllers/botController.mjs
import db from '../models/index.mjs';
import { sendOrEditMessage } from '../utils/botUtils.mjs';
import { Op } from 'sequelize';

export const startCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userData = msg.from;

  try {
    const [user, created] = await db.User.findOrCreate({
      where: { telegramId: userData.id.toString() },
      defaults: {
        telegramId: userData.id.toString(),
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        role: 'user',
        isRegistered: false
      }
    });

    if (!created && user.isRegistered) {
      return showMainMenu(bot, chatId);
    }

    const messageText = `👋 Здравствуйте, ${('@'+userData.username||(userData.first_name+' '+userData.last_name)||"пользователь")}!\nНажмите кнопку ниже, чтобы зарегистрироваться как клиент.`;
    const keyboard = {
      inline_keyboard: [[{
        text: '✅ Зарегистрироваться как клиент',
        callback_data: 'register_client'
      }]]
    };

    // Используем sendOrEditMessage вместо bot.sendMessage
    await sendOrEditMessage(bot, chatId, messageText, {
      reply_markup: keyboard
    });

  } catch (error) {
    console.error("Ошибка при старте:", error);
    await sendOrEditMessage(bot, chatId, "❌ Произошла ошибка. Попробуйте позже.");
  }
};

export const registerUserCallback = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const userData = query.from;

  try {
    const user = await db.User.findOne({ where: { telegramId: userData.id.toString() } });
    if (!user) {
      await sendOrEditMessage(bot, chatId, "❌ Ошибка: пользователь не найден.");
      return;
    }

    // Устанавливаем, что пользователь в процессе регистрации
    await user.update({ isRegistered: false });

    // Получаем или создаём состояние
    let state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    if (!state) {
      state = await db.UserState.create({
        telegramId: chatId.toString(),
        userId: user.id
      });
    } else if (!state.userId) {
      await state.update({ userId: user.id });
    }

    // Устанавливаем шаг ожидания организации
    await state.update({ step: 'awaiting_organisation' });

    const messageText = `🏢 Укажите, пожалуйста, полное название вашей организации в формате:\n\nМБДОУ "Детский сад №123"\nили\nГБОУ СОШ №45`;

    await bot.answerCallbackQuery(query.id);

    await sendOrEditMessage(bot, chatId, messageText);

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    await sendOrEditMessage(bot, chatId, "❌ Ошибка регистрации. Попробуйте позже.");
  }
};

export const registerUserPost = async (bot, query) => {
  const chatId = query.message.chat.id;
  const userData = query.from;

  try {
    const user = await db.User.findOne({ where: { telegramId: userData.id.toString() } });
    if (!user) {
      await sendOrEditMessage(bot, chatId, "❌ Ошибка: пользователь не найден. \n/start");
      return;
    }

    // Убедимся, что пользователь теперь зарегистрирован
    if (!user.isRegistered) {
      await user.update({ isRegistered: true });
    }

    const messageText = `✅ Вы успешно зарегистрированы как клиент, ${('@'+userData.username||(userData.first_name+' '+userData.last_name)||"пользователь")}!\nТеперь вы можете создавать меню и отправлять заявки.`;

    const keyboard = {
      inline_keyboard: [
        [{ text: '🛒 Сделать заявку', callback_data: 'make_order' }],
        [{ text: '📞 Контактная информация', callback_data: 'contact_info' }],
        [{ text: 'ℹ️ Информация о боте', callback_data: 'bot_info' }],
        [{ text: '📝 Мои заявки', callback_data: 'my_orders' }]
      ]
    };

    // Подтверждаем callback (если это настоящий query)
    if (query.id) {
      await bot.answerCallbackQuery(query.id).catch(() => {});
    }

    // Отправляем сообщение
    await sendOrEditMessage(bot, chatId, messageText, {
      reply_markup: keyboard
    });

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    await sendOrEditMessage(bot, chatId, "❌ Ошибка регистрации. Попробуйте позже.");
  }
};

export const showMainMenu = async (bot, chatId) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🛒 Сделать заявку', callback_data: 'make_order' }],
      [{ text: '📞 Контактная информация', callback_data: 'contact_info' }],
      [{ text: 'ℹ️ Информация о боте', callback_data: 'bot_info' }],
      [{ text: '📝 Мои заявки', callback_data: 'my_orders' }]
    ]
  };

  await sendOrEditMessage(bot, chatId, "Добро пожаловать в систему заказа продуктов!", {
    reply_markup: keyboard
  });
};

export const showContactInfo = async (bot, chatId) => {
  const contacts = `
📞 Контактная информация:
Бухгалтерия: +7 (XXX) XXX-XX-XX
Телефон 1: +7 (XXX) XXX-XX-XX
Телефон 2: +7 (XXX) XXX-XX-XX
Телефон ЕИС: +7 (XXX) XXX-XX-XX
📧 Электронная почта: info@example.com
  `;

  const keyboard = {
    inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'main_menu' }]]
  };

  await sendOrEditMessage(bot, chatId, contacts, {
    reply_markup: keyboard
  });
};

export const showBotInfo = async (bot, chatId) => {
  const info = `
ℹ️ Информация о боте:
Этот бот позволяет оформлять заявки на продукты.
Для оформления заявки:
1. Нажмите "Сделать заявку"
2. Выберите категорию
3. Выберите продукт
4. Укажите количество (кратно фасовке)
5.Выбрать что-то еще или "Отправить заявку"
  `;

  const keyboard = {
    inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'main_menu' }]]
  };

  await sendOrEditMessage(bot, chatId, info, {
    reply_markup: keyboard
  });
};

export const showMyOrders = async (bot, chatId) => {
  try {
    const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
    if (!user) {
      await sendOrEditMessage(bot, chatId, "❌ Пользователь не найден.");
      return;
    }

    const orders = await db.Menu.findAll({
      where: { 
        owner_id: user.id,
        is_template: { [Op.gt]: 0 }
      },
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true
    });

    if (!orders.length) {
      await sendOrEditMessage(bot, chatId, "📦 У вас пока нет заявок.", {
        reply_markup: {
          inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'main_menu' }]]
        }
      });
      return;
    }

    let message = "📦 Ваши последние заявки:\n\n";
    const keyboard = [];
    
    orders.forEach(order => {
      message += `${order.name}\n`;
      keyboard.push([{
        text: `Подробнее о ${order.name}`,
        callback_data: `order_details_${order.id}`
      }]);
    });

    message += "\nНажмите на кнопку для просмотра деталей.";
    keyboard.push([{ text: '⬅️ Назад', callback_data: 'main_menu' }]);

    await sendOrEditMessage(bot, chatId, message, {
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (err) {
    console.error("Ошибка при отображении заявок:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось загрузить заявки.");
  }
};

export const showOrderDetails = async (bot, chatId, orderId) => {
  try {
    const order = await db.Menu.findOne({
      where: { id: orderId },
      raw: true
    });

    if (!order) {
      return sendOrEditMessage(bot, chatId, "❌ Заказ не найден.");
    }

    if (!order.is_template || order.is_template <= 0) {
      return sendOrEditMessage(bot, chatId, "📦 Заказ найден, но данные повреждены.");
    }

    const menuItem = await db.MenuItem.findOne({
      where: { id: order.is_template },
      raw: true
    });

    if (!menuItem) {
      return sendOrEditMessage(bot, chatId, "📦 Заказ найден, но данные повреждены (MenuItem не найден).");
    }

    const items = Array.isArray(menuItem.ingredientId) ? menuItem.ingredientId : [];
    if (items.length === 0) {
      return sendOrEditMessage(bot, chatId, "📦 Заказ найден, но в нём нет продуктов.");
    }

    const ingredientIds = items.map(item => item.id);
    const ingredients = await db.Ingredient.findAll({
      where: { id: ingredientIds },
      raw: true
    });

    let message = `📦 Детали "${order.name}":\n\n`;
    for (const item of items) {
      const ingredient = ingredients.find(ing => ing.id === item.id);
      if (ingredient) {
        message += `${ingredient.name} — ${item.quantity} ${ingredient.unit}\n`;
      } else {
        message += `Неизвестный продукт (ID: ${item.id}) — ${item.quantity}\n`;
      }
    }

    if (order.comment) {
      message += `\n💬 Комментарий: ${order.comment}`;
    }

    const keyboard = {
      inline_keyboard: [[{ text: '⬅️ Назад к заявкам', callback_data: 'my_orders' }]]
    };

    await sendOrEditMessage(bot, chatId, message, {
      reply_markup: keyboard
    });

  } catch (err) {
    console.error("Ошибка при отображении деталей заказа:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось загрузить детали заказа.");
  }
};