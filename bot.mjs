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

// bot.mjs → message handler
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
  if (!user || !user.isRegistered) return;

  const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
  if (!state) return;

  // Если пользователь вводит комментарий
  if (state.step === 'entering_comment') {
    await state.update({
      comment: text,
      step: null
    });
    const keyboard = [
      [
        { text: '👩‍🍳Отправить заявку', callback_data: 'submit_order' },
        { text: '⬅️ Выбрать ещё', callback_data: `main_menu'}` }
      ]
    ]

    await bot.sendMessage(chatId, "✅ Комментарий сохранен!", {
       reply_markup: {
        inline_keyboard: keyboard
      }
    });
    return;
  }

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

// bot.mjs → callback_query
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;

  try {
    const requester = await db.User.findOne({ where: { telegramId: chatId.toString() } });
    
    if (data.startsWith('category_')) {
      const category = data.replace('category_', '');
      await userController.showIngredientsInCategory(bot, chatId, category);
      return;
    }

    if(data === 'register_client'){
      botController.registerUserCallback(bot, query)
      return;
    }
    // Защита от незарегистрированных пользователей
    if (!requester || !requester.isRegistered) {
      return bot.answerCallbackQuery(query.id, "⚠️ Вы не зарегистрированы.", true);
    }

    // Обработка главного меню
    if (data === 'main_menu') {
      await botController.showMainMenu(bot, chatId);
      return;
    }
     // Обработка "Мои заявки"
    if (data === 'my_orders') {
      await botController.showMyOrders(bot, chatId);
      return;
    }

    // Обработка просмотра деталей заказа
    if (data.startsWith('order_details_')) {
      const orderId = data.replace('order_details_', '');
      await botController.showOrderDetails(bot, chatId, orderId);
      return;
    }

    // Обработка "Сделать заявку"
    if (data === 'make_order') {
      await userController.showCategoriesMenu(bot, chatId);
      return;
    }

    // Обработка категорий
    if (data.startsWith('category_')) {
      const category = data.replace('category_', '');
      await userController.showIngredientsInCategory(bot, chatId, category);
      return;
    }

    // Обработка ингредиентов
    if (data.startsWith('ingredient_')) {
      const ingredientId = data.replace('ingredient_', '');
      await userController.showIngredientQuantityOptions(bot, chatId, ingredientId);
      return;
    }

    // Обработка выбора количества
    if (data.startsWith('quantity_')) {
      const [_, ingredientId, amount] = data.split('_');
      await userController.handleQuantitySelection(bot, chatId, ingredientId, amount);
      return;
    }

    // Обработка отправки заказа
    if (data === 'submit_order') {
      await userController.submitOrder(bot, chatId);
      return;
    }

    // Обработка "Комментарии"
    if (data === 'enter_comment') {
      await userController.enterCommentMode(bot, chatId);
      return;
    }

    // Обработка админских действий
    if (requester.role === 'admin') {
      switch (data) {
        case 'admin_add_ingredient':
          await bot.sendMessage(chatId, "➕ Введите команду:\n/add_ingredient имя единица_измерения категория фасовка_количество мин_заказ макс_заказ");
          break;
        
        case 'admin_list_templates':
          await adminController.listTemplates(bot, query);
          break;
          
        case 'admin_set_notification_time':
          await adminController.setNotificationTime(bot, query);
          break;
          
        case 'admin_send_broadcast':
          await adminController.broadcastMessage(bot, query);
          break;
          
        default:
          if (data.startsWith('admin_select_ingredient_')) {
            await adminController.deleteIngredient(bot, query);
          } else if (data.startsWith('admin_ingredient_prev_page_') || data.startsWith('admin_ingredient_next_page_')) {
            await adminController.showIngredients(bot, query);
          }
          break;
      }
      return;
    }

    // Обработка остальных действий
    switch (data) {
      case 'contact_info':
        await botController.showContactInfo(bot, chatId);
        break;
        
      case 'bot_info':
        await botController.showBotInfo(bot, chatId);
        break;
        
      case 'my_orders':
        await botController.showMyOrders(bot, chatId);
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

scheduleJob('0 9 * * *', async () => {
  await sendDailyMenu(bot);
});

export default bot;