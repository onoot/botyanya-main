// services/botService.mjs
import db from '../models/index.mjs';
import { getMenuForToday } from './databaseService.mjs'; 
import { sendDailyMenuToUser } from './menuService.mjs';

export const sendDailyMenu = async (bot) => {
  try {
    // Получаем меню на сегодня
    const menu = await getMenuForToday(); 

    if (!menu || !menu.items.length) {
      console.log("❌ Меню на сегодня не найдено");
      return;
    }

    // Находим всех зарегистрированных пользователей
    const users = await db.User.findAll({
      where: { isRegistered: true },
      raw: true
    });

    for (const user of users) {
      const message = `📅 Подтвердите ежедневную анкету\nЕжедневное меню на ${new Date().toLocaleDateString()}:\n\n` +
        menu.items.map(item => 
          `${item.ingredientName} — ${item.requiredAmount}${item.ingredientUnit}`
        ).join('\n');

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [{ text: '✅ Подтвердить заказ', callback_data: 'confirm_daily_menu' }],
            [{ text: '🔁 Изменить количество', callback_data: 'edit_ingredients' }]
          ]
        }
      };

      await bot.sendMessage(user.telegramId, message, keyboard);
    }

  } catch (error) {
    console.error("❌ Ошибка при рассылке меню:", error.message);
  }
};

export const handleSetTime = async (bot, query) => {
  const chatId = query.message.chat.id;
  const match = query.data.match(/admin_set_time_(\d{2}:\d{2})/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Время не распознано", true);
  }

  const selectedTime = match[1];

  try {
    // Обновляем у всех пользователей время в UserState
    await db.UserState.update(
      { notificationTime: selectedTime },
      { where: {} } // Все записи
    );

    // Перезапускаем рассылку
    scheduleCustomDailyMenu(bot, selectedTime);

    await bot.sendMessage(chatId, `✅ Время рассылки установлено: ${selectedTime}`);
    await bot.answerCallbackQuery(query.id, `Время изменено на ${selectedTime}`, true);

  } catch (err) {
    console.error("Ошибка установки времени:", err);
    await bot.sendMessage(chatId, "❌ Не удалось установить время рассылки.");
  }
};

export const scheduleCustomDailyMenu = (bot, time = '09:00') => {
  const [hour, minute] = time.split(':').map(Number);

  // Удаляем старые задачи
  if (global.dailyMenuJob) {
    global.dailyMenuJob.cancel();
  }

  // Устанавливаем новое расписание
  global.dailyMenuJob = scheduleJob(`0 ${minute} ${hour} * * *`, async () => {
    console.log(`📩 Рассылка меню запланирована на ${hour}:${minute}`);

    const users = await db.UserState.findAll({ raw: true });

    for (const state of users) {
      try {
        await sendDailyMenuToUser(bot, state.telegramId);
      } catch (err) {
        console.error(`Не удалось отправить пользователю ${state.telegramId}:`, err.message);
      }
    }
  });
};