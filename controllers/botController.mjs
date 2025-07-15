// controllers/botController.mjs
import db from '../models/index.mjs';
import { deleteMessage } from '../utils/botUtils.mjs';
import {showAdminPanel} from './adminController.mjs'


export const registerUser = async (bot, msg) => {
  const chatId = msg.chat.id;
  try {
    const [user, created] = await db.User.findOrCreate({
      where: { telegramId: chatId.toString() },
      defaults: {
        username: msg.from.username || '',
        firstName: msg.from.first_name,
        lastName: msg.from.last_name
      }
    });
    if (!created) {
      return bot.sendMessage(chatId, "❌ Вы уже зарегистрированы");
    }
    // ✅ Создаем UserState при регистрации
    await db.UserState.create({
      telegramId: chatId.toString(),
      userId: user.id
    });
    bot.sendMessage(chatId, "✅ Регистрация успешна!");
  } catch (err) {
    console.error("Ошибка регистрации:", err);
    bot.sendMessage(chatId, "❌ Ошибка регистрации");
  }
};

// ✅ Для команды /register
export const registerUserCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userData = msg.from;

  if (!userData.username) {
    return bot.sendMessage(chatId, "⚠️ Для регистрации требуется юзернейм");
  }

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

    await bot.sendMessage(chatId, "✅ Вы зарегистрированы как клиент!", {
      reply_markup: {
        inline_keyboard: [[{ text: '🍽 Выбрать шаблон меню', callback_data: 'select_template' }]]
      }
    });

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    await bot.sendMessage(chatId, "❌ Ошибка регистрации. Попробуйте позже.");
  }
};

// ✅ Для нажатия на кнопку "Зарегистрироваться"
export const registerUserCallback = async (bot, query) => {
  const chatId = query.message.chat.id;
  const userData = query.from;

  try {
    const user = await db.User.findOne({ where: { username: userData.username } });
    if (!user) {
      await bot.sendMessage(chatId, "❌ Ошибка: пользователь не найден.");
      return;
    }

    await user.update({ isRegistered: true });

    const messageText = `✅ Вы успешно зарегистрированы как клиент, @${userData.username}!\nТеперь вы можете создавать меню и отправлять заявки.`;
    const keyboard = {
      reply_markup: {
        inline_keyboard: [[{ text: '🍽 Выбрать шаблон меню', callback_data: 'select_template' }]]
      }
    };

    await bot.editMessageText(messageText, {
      chat_id: chatId,
      message_id: query.message.message_id,
      reply_markup: keyboard.reply_markup
    });

  } catch (err) {
    console.error("Ошибка регистрации:", err);
    await bot.sendMessage(chatId, "❌ Ошибка регистрации. Попробуйте позже.");
  }
};

// controllers/botController.mjs
export const startCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userData = msg.from;

  if (!userData.username) {
    await bot.sendMessage(chatId, "⚠️ Для использования бота требуется Telegram-юзернейм.");
    return;
  }

  try {
    const [user, created] = await db.User.findOrCreate({
      where: { username: userData.username },
      defaults: {
        telegramId: userData.id.toString(),
        firstName: userData.first_name || '',
        lastName: userData.last_name || '',
        role: 'user',
        isRegistered: false
      }
    });

    let messageText;
    let keyboard;

    // Проверяем, является ли пользователь админом
    if (user.role === 'admin') {
      await showAdminPanel(bot, chatId)
      return;
    } else if (!created && user.isRegistered) {
      messageText = `👋 Привет, @${userData.username}!\nГотовы сделать заказ?`;
      keyboard = {
        reply_markup: {
          inline_keyboard: [[{
            text: '🍽 Выбрать шаблон',
            callback_data: 'select_template'
          }]]
        }
      };
    } else {
      messageText = `👋 Здравствуйте, @${userData.username}!\nНажмите кнопку ниже, чтобы зарегистрироваться как клиент.`;
      keyboard = {
        reply_markup: {
          inline_keyboard: [[{
            text: '✅ Зарегистрироваться как клиент',
            callback_data: 'register_client'
          }]]
        }
      };
    }

    await bot.sendMessage(chatId, messageText, keyboard);

  } catch (error) {
    console.error("Ошибка при старте:", error);
    await bot.sendMessage(chatId, "❌ Произошла ошибка. Попробуйте позже.");
  }
};
