// services/menuService.js
import {sendOrEditMessage} from '../utils/botUtils.mjs'

export const sendDailyMenuToUser = async (bot, telegramId) => {
  const menu = await getMenuForToday(); // Твой SQL-запрос или Sequelize

  if (!menu) {
    return sendOrEditMessage(telegramId, "🍽 Меню на сегодня не готово.");
  }

  const message = `📅 Ежедневное меню:\n\n` +
    menu.items.map(item => 
      `${item.ingredientName} — ${item.requiredAmount}${item.ingredientUnit}`
    ).join('\n');

  await sendOrEditMessage(telegramId, message);
};``