// services/menuService.js
export const sendDailyMenuToUser = async (bot, telegramId) => {
  const menu = await getMenuForToday(); // Твой SQL-запрос или Sequelize

  if (!menu) {
    return bot.sendMessage(telegramId, "🍽 Меню на сегодня не готово.");
  }

  const message = `📅 Ежедневное меню:\n\n` +
    menu.items.map(item => 
      `${item.ingredientName} — ${item.requiredAmount}${item.ingredientUnit}`
    ).join('\n');

  await bot.sendMessage(telegramId, message);
};