// controllers/botController.mjs
import db from '../models/index.mjs';
import { deleteMessage } from '../utils/botUtils.mjs';
import { Op } from 'sequelize';

export const startCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userData = msg.from;

  // if (!userData.username) {
  //   return bot.sendMessage(chatId, "⚠️ Для использования бота требуется Telegram-юзернейм.");
  // }

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
      reply_markup: {
        inline_keyboard: [[{
          text: '✅ Зарегистрироваться как клиент',
          callback_data: 'register_client'
        }]]
      }
    };

    await bot.sendMessage(chatId, messageText, keyboard);

  } catch (error) {
    console.error("Ошибка при старте:", error);
    await bot.sendMessage(chatId, "❌ Произошла ошибка. Попробуйте позже.");
  }
};

export const registerUserCallback = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const userData = query.from;

  try {
    const user = await db.User.findOne({ where: { telegramId: userData.id.toString() } });
    if (!user) {
      await bot.sendMessage(chatId, "❌ Ошибка: пользователь не найден.");
      return;
    }

    await user.update({ isRegistered: true });

    const messageText = `✅ Вы успешно зарегистрированы как клиент, ${('@'+userData.username||(userData.first_name+' '+userData.last_name)||"пользователь")}!\nТеперь вы можете создавать меню и отправлять заявки.`;

   const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 Сделать заявку', callback_data: 'make_order' }],
        [{ text: '📞 Контактная информация', callback_data: 'contact_info' }],
        [{ text: 'ℹ️ Информация о боте', callback_data: 'bot_info' }],
        [{ text: '📝 Мои заявки', callback_data: 'my_orders' }]
      ]
    }
  };

    // Сначала удаляем старое сообщение
    await bot.deleteMessage(chatId, message_id).catch(() => { });

    // Затем отправляем новое с клавиатурой
    await bot.sendMessage(chatId, messageText, keyboard);
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    await bot.sendMessage(chatId, "❌ Ошибка регистрации. Попробуйте позже.");
  }
};

export const showMainMenu = async (bot, chatId) => {
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🛒 Сделать заявку', callback_data: 'make_order' }],
        [{ text: '📞 Контактная информация', callback_data: 'contact_info' }],
        [{ text: 'ℹ️ Информация о боте', callback_data: 'bot_info' }],
        [{ text: '📝 Мои заявки', callback_data: 'my_orders' }]
      ]
    }
  };

  await bot.sendMessage(chatId, "Добро пожаловать в систему заказа ингредиентов!", keyboard);
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
    reply_markup: {
      inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'main_menu' }]]
    }
  };

  await bot.sendMessage(chatId, contacts, keyboard);
};

export const showBotInfo = async (bot, chatId) => {
  const info = `
ℹ️ Информация о боте:
Этот бот позволяет оформлять заявки на ингредиенты.
Для оформления заявки:
1. Нажмите "Сделать заявку"
2. Выберите категорию
3. Выберите ингредиент
4. Укажите количество (кратно фасовке)
5. Нажмите "Отправить заявку"
  `;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'main_menu' }]]
    }
  };

  await bot.sendMessage(chatId, info, keyboard);
};
export const showMyOrders = async (bot, chatId) => {
  try {
   // Сначала получаем пользователя
    const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
    if (!user) {
      await bot.sendMessage(chatId, "❌ Пользователь не найден.");
      return;
    }

    // Получаем заказы (меню, созданные пользователем)
    const orders = await db.Menu.findAll({
      where: { 
        owner_id: user.id,
        // Исправлено: Op.gt (greater than) вместо Op.get
        is_template: { [Op.gt]: 0 }
      },
      order: [['created_at', 'DESC']],
      limit: 5,
      raw: true
    });

    if (!orders.length) {
      await bot.sendMessage(chatId, "📦 У вас пока нет заявок.", {
        reply_markup: {
          inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'main_menu' }]]
        }
      });
      return;
    }

    let message = "📦 Ваши последние заявки:\n\n";
    
    // Формируем клавиатуру с кнопками для просмотра деталей
    const keyboard = [];
    
    orders.forEach(order => {
      message += `${order.name}\n`;
      // Исправлена опечатка: order.od -> order.id
      keyboard.push([{
        text: `Подробнее о ${order.name}`,
        callback_data: `order_details_${order.id}`
      }]);
    });

    message += "\nНажмите на кнопку для просмотра деталей.";

    keyboard.push([{ text: '⬅️ Назад', callback_data: 'main_menu' }]);

    await bot.sendMessage(chatId, message, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } catch (err) {
    console.error("Ошибка при отображении заявок:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить заявки.");
  }
};

export const showOrderDetails = async (bot, chatId, orderId) => {
  try {
    // ✅ Получаем заказ
    const order = await db.Menu.findOne({
      where: { id: orderId },
      raw: true
    });

    if (!order) {
      return bot.sendMessage(chatId, "❌ Заказ не найден.");
    }

    // ✅ В новой структуре is_template содержит ID связанного MenuItem
    if (!order.is_template || order.is_template <= 0) {
      return bot.sendMessage(chatId, "📦 Заказ найден, но данные повреждены.");
    }

    // ✅ Получаем связанный MenuItem
    const menuItem = await db.MenuItem.findOne({
      where: { id: order.is_template },
      raw: true
    });

    if (!menuItem) {
      return bot.sendMessage(chatId, "📦 Заказ найден, но данные повреждены (MenuItem не найден).");
    }

    // ✅ Получаем данные из ingredientId (массив объектов { id, quantity })
    const items = Array.isArray(menuItem.ingredientId) ? menuItem.ingredientId : [];
    
    if (items.length === 0) {
      return bot.sendMessage(chatId, "📦 Заказ найден, но в нём нет ингредиентов.");
    }

    // ✅ Получаем ID ингредиентов
    const ingredientIds = items.map(item => item.id);
    
    // ✅ Получаем ингредиенты
    const ingredients = await db.Ingredient.findAll({
      where: { id: ingredientIds },
      raw: true
    });

    // ✅ Формируем сообщение
    let message = `📦 Детали "${order.name}":\n\n`;

    // Используем данные из массива items
    for (const item of items) {
      const ingredient = ingredients.find(ing => ing.id === item.id);
      if (ingredient) {
        message += `${ingredient.name} — ${item.quantity} ${ingredient.unit}\n`;
      } else {
        message += `Неизвестный ингредиент (ID: ${item.id}) — ${item.quantity}\n`;
      }
    }

    if (order.comment) {
      message += `\n💬 Комментарий: ${order.comment}`;
    }

    const keyboard = {
      reply_markup: {
        inline_keyboard: [[{ text: '⬅️ Назад к заявкам', callback_data: 'my_orders' }]]
      }
    };

    await bot.sendMessage(chatId, message, keyboard);

  } catch (err) {
    console.error("Ошибка при отображении деталей заказа:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить детали заказа.");
  }
};