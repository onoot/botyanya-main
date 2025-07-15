// utils/botUtils.mjs
export const deleteMessage = async (bot, chatId, message_id) => {
  try {
    await bot.deleteMessage(chatId, message_id);
  } catch (err) {
    console.warn("Сообщение не найдено или уже удалено:", err.message);
  }
};