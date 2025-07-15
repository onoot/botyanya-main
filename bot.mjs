// bot.mjs
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import { scheduleJob } from 'node-schedule';
import { sendDailyMenu } from './services/botService.mjs';
import db from './models/index.mjs';
import * as botController from './controllers/botController.mjs';
import * as menuController from './controllers/menuController.mjs';
import * as adminController from './controllers/adminController.mjs';
import * as userController from './controllers/userController.mjs';
import { deleteMessage } from './utils/botUtils.mjs';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Синхронизация БД
await db.sequelize.sync({ force: false });
console.log('База данных синхронизирована');

// Команды
bot.onText(/\/start/, (msg) => botController.startCommand(bot, msg));

bot.onText(/\/move_ingredient/, async (msg) => {
  const chatId = msg.chat.id;
  await exports.moveIngredientToCategory(bot, { message: msg });
});
bot.onText(/\/register/, (msg) => botController.registerUser(bot, msg));
bot.onText(/\/register_admin/, (msg) => botController.registerAdmin(bot, msg));
bot.onText(/\/add_admin (\d+)/, (msg, match) => botController.addAdmin(bot, msg, match));

bot.onText(/\/add_ingredient/, (msg) => adminController.addIngredient(bot, msg));
bot.onText(/\/delete_ingredient/, (msg) => adminController.deleteIngredient(bot, msg));
bot.onText(/\/move_ingredient/, (msg) => adminController.moveIngredientToCategory(bot, msg));
bot.onText(/\/delete_user/, (msg) => adminController.deleteUser(bot, msg));

bot.onText(/\/create_menu/, (msg) => userController.createMenuCommand(bot, msg));
bot.onText(/\/addmenu/, (msg) => menuController.addMenuCommand(bot, msg));

bot.onText(/\/add_template_menu (.+)/, (msg) => userController.createTemplateMenu(bot, msg));

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
  if (!user || !user.isRegistered) return;

  const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
  if (!state) return;

  // Если пользователь вводит количество
  if (state.editingIngredientId && state.currentMenuId && !text.startsWith('/')) {
    await userController.handleIngredientQuantityInput(bot, msg);
  }
});


// bot.mjs → message handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
  if (!user || !user.isRegistered) return;

  const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
  if (!state) return;

  // Если админ вводит сообщение для рассылки
  if (user.role === 'admin' && state.step === 'broadcast') {
    await state.update({ step: null });

    const users = await db.User.findAll({ where: { isRegistered: true }, raw: true });

    for (const user of users) {
      try {
        await bot.sendMessage(user.telegramId, `📢 Админ отправил:\n\n${text}`);
      } catch (err) {
        console.error(`Не удалось отправить пользователю ${user.telegramId}:`, err.message);
      }
    }

    await bot.sendMessage(chatId, "✅ Рассылка выполнена.");
    return;
  }

  // Если пользователь вводит количество
  if (state.editingIngredientId && state.currentMenuId && !text.startsWith('/')) {
    await userController.handleIngredientQuantityInput(bot, msg);
  }
});

// bot.mjs
const processedMessages = new Set();
let Enable = false;

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const messageId = msg.message_id;

  const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
  if (!user || !user.isRegistered) return;

  const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
  if (!state) return;

  // Защита от дубликатов
  const messageKey = `${chatId}:${messageId}:${text}`;
  if (processedMessages.has(messageKey)) return;
  processedMessages.add(messageKey);

  // Рассылка
  // if (user.role === 'admin' && state.step === 'broadcast') {
  if (user.role === 'admin' &&Enable) {
    await state.update({ step: null });

    const users = await db.User.findAll({ where: { isRegistered: true }, raw: true });

    for (const user of users) {
      try {
        await bot.sendMessage(user.telegramId, `📢 Админ отправил:\n\n${text}`);
      } catch (err) {
        console.error(`Не удалось отправить пользователю ${user.telegramId}:`, err.message);
      }
    }

    await bot.sendMessage(chatId, "✅ Рассылка выполнена.");
    return;
  }

  // Обработка количества
  if (state.editingIngredientId && state.currentMenuId && !text.startsWith('/')) {
    await userController.handleIngredientQuantityInput(bot, msg);
  }
  Enable=false;
});

bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const data = query.data;

  try {
    const requester = await db.User.findOne({ where: { telegramId: chatId.toString() } });

    if (!requester || (!requester.isRegistered && data !== "register_client")) {
      return bot.answerCallbackQuery(query.id, "⚠️ Вы не зарегистрированы.", true);
    }

    const isAdmin = requester.role === 'admin';

    if (isAdmin && data.startsWith('admin_')) {
      switch (data) {
        case 'admin_add_ingredient':
          await bot.sendMessage(chatId, "➕ Введите команду:\n/add_ingredient имя единица_измерения категория");
          break;

        case 'admin_delete_ingredient':
          await adminController.showIngredients(bot, query);
          break;

        case 'admin_move_ingredient':
          await bot.sendMessage(chatId, "📂 Введите команду:\n/move_ingredient имя новая_категория");
          break;

        case 'admin_list_templates':
          deleteMessage(bot, chatId, message_id)
          await adminController.listTemplates(bot, query); 
          break;

        case 'admin_set_notification_time':
          deleteMessage(bot, chatId, message_id)
          await adminController.setNotificationTime(bot, chatId); 
          break;

        case 'admin_send_broadcast':
          deleteMessage(bot, chatId, message_id)
          Enable=true;
          await bot.sendMessage(chatId, "📢 Введите сообщение для рассылки:");
           
          break;
        case 'admin_back_to_menu':
          await adminController.showAdminPanel(bot, chatId);
          break;
        case 'admin_delete_user':
          await bot.sendMessage(chatId, "🗑 Введите команду:\n/delete_user username");
          break;

        default:
          if (data.startsWith('admin_set_time_')) {
            await adminController.handleSetTime(bot, query);
          }
        else  if (data.startsWith('admin_select_ingredient_')) {
            await adminController.deleteIngredient(bot, query);
          } else if (data.startsWith('admin_ingredient_prev_page_') || data.startsWith('admin_ingredient_next_page_')) {
            await adminController.showIngredients(bot, query);
          } else if (data.startsWith('use_template_')) {
            await exports.handleUseTemplate(bot, query);
          } else if (data.startsWith('select_category_')) {
            await userController.selectCategory(bot, query);
          } else if (data.startsWith('add_ingredient_to_menu_')) {
            await userController.addIngredientToMenu(bot, query);
          }
          break;
      }

      return;
    }

    // 👤 Пользовательские действия
    switch (true) {
      case data === 'register_client':
        await botController.registerUserCallback(bot, query);
        break;

      case data === 'select_template':
        await userController.showTemplateMenu(bot, chatId);
        break;

      case data === 'get_menu_today':
        await bot.sendMessage(chatId, "📅 Получение сегодняшнего меню...");
        break;

      case data === 'create_new_template':
        await bot.sendMessage(chatId, "Введите имя нового шаблона:");
        break;

      case data === 'user_add_ingredient':
        await userController.showCategories(bot, chatId);
        break;

      case data === 'user_edit_ingredients':
        await userController.handleEditIngredients(bot, query);
        break;

      case data === 'user_confirm_order':
        await userController.handleMakeOrder(bot, query);
        break;

      case data.startsWith('use_template_'):
        await userController.handleUseTemplate(bot, query);
        break;

      case data.startsWith('select_category_'):
        await userController.selectCategory(bot, query);
        break;

      case data.startsWith('select_ingredient_for_menu_'):
        await userController.handleSelectIngredientForMenu(bot, query);
        break;

      case data.startsWith('add_ingredient_to_menu_'):
        await userController.addIngredientToMenu(bot, query);
        break;

      case data.startsWith('edit_ingredient_'):
        await userController.handleSelectIngredientForEdit(bot, query);
        break;

      case data === 'cancel_selection':
        await bot.editMessageText(
          "❌ Вы отменили действие.",
          chatId,
          message_id,
          {
            reply_markup: {
              inline_keyboard: [[{
                text: '⬅️ Вернуться к шаблонам',
                callback_data: 'select_template'
              }]]
            }
          }
        );
        break;

      default:
        console.warn(`Неизвестное действие: ${data}`);
        await bot.answerCallbackQuery(query.id, "🚫 Неизвестное действие", true);
        break;
    }

  } catch (err) {
    console.error("Ошибка в callback_query:", err);
    await bot.sendMessage(chatId, "❌ Произошла ошибка. Попробуйте снова.");
  }
});

// Ежедневная рассылка
scheduleJob('0 9 * * *', async () => {
  await sendDailyMenu(bot);
});

export default bot;