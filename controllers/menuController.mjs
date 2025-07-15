// controllers/menuController.mjs
import { getMenuForToday } from '../services/databaseService.mjs';
import { deleteMessage } from '../utils/botUtils.mjs';

export const addMenuCommand = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const args = text.split(' ').slice(1);

  if (args.length < 2) {
    await bot.sendMessage(chatId, "Используйте: /addmenu ДД.ММ.ГГГГ ингредиент1=количество1 ингредиент2=количество2...");
    return;
  }

  const dateStr = args[0];
  const items = args.slice(1).map(arg => {
    const [name, amount] = arg.split('=');
    return { name, amount: parseFloat(amount) };
  });

  try {
    await getMenuForToday(dateStr, items);
    await bot.sendMessage(chatId, `Меню на ${dateStr} успешно создано.`);
  } catch (error) {
    await bot.sendMessage(chatId, `Ошибка создания меню: ${error.message}`);
  }
};