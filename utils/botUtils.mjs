// utils/botUtils.mjs
import db from '../models/index.mjs';

export const deleteMessage = async (bot, chatId, message_id) => {
  try {
    await bot.deleteMessage(chatId, message_id);
  } catch (err) {
    console.warn("Сообщение не найдено или уже удалено:", err.message);
  }
};

export const sendOrEditMessage = async (bot, chatId, message, options = {}) => {
  try {
    // Находим состояние пользователя
    let state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    
    // Если состояние не найдено, создаём его
    if (!state) {
      const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
      if (user) {
        state = await db.UserState.create({
          telegramId: chatId.toString(),
          userId: user.id
        });
      } else {
        // Если пользователя нет, создаём без userId
        state = await db.UserState.create({
          telegramId: chatId.toString()
        });
      }
    }

    // Обрабатываем опции
    const { reply_markup, parse_mode = 'HTML', ...otherOptions } = options;
    
    // Если есть старое сообщение — редактируем его
    if (state.lastBotMessageId) {
      try {
        await bot.editMessageText(message, {
          chat_id: chatId,
          message_id: state.lastBotMessageId,
          reply_markup,
          parse_mode,
          ...otherOptions
        });
        return;
      } catch (err) {
        // Если сообщение нельзя отредактировать, удаляем
        if (err.code === 400 && err.description.includes('message is not modified')) {
          return; // Ничего не делаем
        }
        
        try {
          await bot.deleteMessage(chatId, state.lastBotMessageId);
        } catch (delErr) {
          console.error("Не удалось удалить старое сообщение:", delErr.message);
        }
      }
    }

    // Отправляем новое сообщение
    const sentMessage = await bot.sendMessage(chatId, message, {
      reply_markup,
      parse_mode,
      ...otherOptions
    });
    
    // Сохраняем ID нового сообщения
    await state.update({ lastBotMessageId: sentMessage.message_id });

  } catch (err) {
    console.error("Ошибка отправки/редактирования сообщения:", err);
    // Попытка отправить сообщение напрямую как фоллбэк
    try {
      await bot.sendMessage(chatId, message, options);
    } catch (finalErr) {
      console.error("Не удалось отправить сообщение даже после ошибки:", finalErr);
    }
  }
};