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
import {sendOrEditMessage} from './utils/botUtils.mjs'

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// Синхронизация БД
if (false) {
  await db.sequelize.sync({ force: false });
  console.log('База данных синхронизирована');
}


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

// bot.mjs → после других onText
bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
    
    if (!user) {
      return sendOrEditMessage(bot, chatId, "❌ Пользователь не найден.");
    }

    if (user.role !== 'admin') {
      return sendOrEditMessage(bot, chatId, "🔒 Доступ запрещён. У вас нет прав администратора.");
    }

    const adminCommands = `
🛠 <b>Админ-команды</b>:

/add_ingredient <i>имя ед.изм категория фасовка мин_заказ макс_заказ</i>
— Добавить новый ингредиент

/delete_ingredient
— Удалить ингредиент (через меню)

/move_ingredient <i>имя_ингредиента новая_категория</i>
— Переместить ингредиент в другую категорию

/delete_user <i>username</i>
— Удалить пользователя

/export_orders
— Выгрузить все заказы по категориям в Excel

/set_notification_time
— Установить время ежедневной рассылки

/send_broadcast
— Отправить сообщение всем пользователям
`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [[
          { text: '🛠 Открыть админ-панель', callback_data: 'admin_open_panel' }
        ]]
      }
    };

    await sendOrEditMessage(bot, chatId, adminCommands, {
      parse_mode: 'HTML',
      ...keyboard
    });

  } catch (err) {
    console.error("Ошибка в команде /admin:", err);
    await sendOrEditMessage(bot, chatId, "❌ Произошла ошибка при отображении команд.");
  }
});
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
  if (!user) return;

  const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
  if (!state) return;

  // ✅ 1. Обработка ввода организации
  if (state.step === 'awaiting_organisation') {
     if (user.role === 'admin') {
      await state.update({ step: null });
      await bot.sendMessage(bot, chatId, "⚠️ Администратор не должен проходить регистрацию.");
      return;
    }
    // ✅ Исправленный regex
    const orgRegex = /^(МБДОУ|МКДОУ|МОУ|ГБОУ|ГБДОУ|ДОУ|Детский сад|Школа|Лицей|Гимназия|Учреждение)\s*["«]?[А-Яа-яЁё\s\d№\-]+["»]?$/;

    if (!orgRegex.test(text)) {
      await sendOrEditMessage(bot, chatId, `⚠️ Пожалуйста, укажите название организации в формате:\n\nМБДОУ "Детский сад №123"\nили\nГБОУ СОШ №45`);
      return;
    }

    // ✅ Сохраняем организацию
    await user.update({ organisation: text });
    await state.update({ step: null });

    // ✅ Вызываем завершение регистрации
    const fakeQuery = {
      id: 'fake_id',
      from: msg.from,
      message: { chat: { id: chatId }, message_id: msg.message_id }
    };

    await botController.registerUserPost(bot, fakeQuery);
    return;
  }
  if (!user || !user.isRegistered) return;

  const keyb = [[{ text: '❌ Отмена', callback_data: 'main_menu' }]]
  // Если пользователь вводит комментарий
  if (state.step === 'entering_comment') {
    // ✅ Сохраняем комментарий
    await state.update({
      comment: text,
      step: null
    });

    const keyboard = [
      [
        { text: '👩‍🍳 Отправить заявку', callback_data: 'submit_order' },
      ],  
      [
        { text: '➕ Добавить еще', callback_data: 'make_order' },
      ],
      [
        { text: '🗑 Удалить комментарий', callback_data: 'delete_comment' },
      ],
      [
        { text: '✏ Редактировать комментарий', callback_data: 'edit_comment' },
      ],
      [
        { text: '⬅️ Назад', callback_data: 'main_menu' }
      ]
    ];

    await sendOrEditMessage(bot, chatId, `✅ Комментарий сохранён!\nВы написали: "${text}"`, {
      reply_markup: { inline_keyboard: keyboard }
    });
    return;
  }

  // Если пользователь редактирует комментарий
  if (state.step === 'editing_comment') {
    await state.update({
      comment: text,
      step: null
    });

    await sendOrEditMessage(bot, chatId, `✅ Комментарий обновлён!\nНовый текст: "${text}"`, {
      reply_markup: { inline_keyboard: keyb }
    });
    return;
  }
  // Если админ вводит сообщение для рассылки
  if (user.role === 'admin' && state.step === 'manager') {
    await state.update({ step: null });

    const users = await db.User.findAll({ where: { isRegistered: true }, raw: true });

    for (const user of users) {
      try {
        await sendOrEditMessage(bot, user.telegramId, `📢 Админ отправил:\n\n${text}`);
      } catch (err) {
        console.error(`Не удалось отправить пользователю ${user.telegramId}:`, err.message);
      }
    }

    await sendOrEditMessage(bot, chatId, "✅ Рассылка выполнена.");
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

    if (data === 'edit_comment') {
      await userController.editCommentMode(bot, chatId);
      return;
    }

    if (data === 'delete_comment') {
      await userController.deleteComment(bot, chatId);
      return;
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
          case 'admin_open_panel':
            await adminController.showAdminPanel(bot, chatId);
            return;
          case 'admin_export_orders':
            await adminController.exportOrdersByCategory(bot, chatId);
            return;

          case 'admin_list_templates':
            await adminController.listTemplates(bot, query);
            return;

          case 'admin_set_notification_time':
            await adminController.setNotificationTime(bot, query);
            return;

          case 'admin_send_broadcast':
            await adminController.broadcastMessage(bot, query);
            return;

          default:
            if (data.startsWith('exp_cat_')) {
              await adminController.handleExportCategory(bot, query);
              return;
            }
            if (data.startsWith('admin_select_ingredient_')) {
              await adminController.deleteIngredient(bot, query);
              return;
            }
            if (data.startsWith('admin_ingredient_prev_page_') || data.startsWith('admin_ingredient_next_page_')) {
              await adminController.showIngredients(bot, query);
              return;
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
        console.warn(`Внутрення ошибка: ${data}`);
        await bot.answerCallbackQuery(query.id, "🚫 Внутрення ошибка", true);
        break;
    }

  } catch (err) {
    console.error("Ошибка в callback_query:", err);
    await sendOrEditMessage(bot, chatId, "❌ Произошла ошибка. Попробуйте снова.");
  }
});

scheduleJob('0 9 * * *', async () => {
  await sendDailyMenu(bot);
});

export default bot;