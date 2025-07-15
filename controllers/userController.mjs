import db from '../models/index.mjs';
import {Op} from 'sequelize'
import { deleteMessage } from '../utils/botUtils.mjs';

/**
 * Обработчик редактирования ингредиентов в шаблоне
 */
export const handleAddIngredientToMenu = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    if (!state || !state.currentMenuId) {
      return bot.sendMessage(chatId, "❌ Не выбрано меню.");
    }

    const ingredients = await db.Ingredient.findAll({ raw: true });

    const keyboard = ingredients.map(ingredient => [{
      text: `${ingredient.name} (${ingredient.category})`,
      callback_data: `select_ingredient_for_menu_${state.currentMenuId}_${ingredient.id}`
    }]);

    keyboard.push([{ text: '⬅️ Назад', callback_data: 'user_edit_ingredients' }]);

    // ✅ ПРАВИЛЬНЫЙ ВЫЗОВ editMessageText
    await bot.editMessageText(
      "🔍 Выберите ингредиент:",
      chatId,
      message_id,
      { reply_markup: { inline_keyboard: keyboard } }
    );

  } catch (err) {
    console.error("Ошибка отображения ингредиентов:", err);
    await bot.sendMessage(chatId, "❌ Ошибка загрузки ингредиентов.");
  }
};

// Клавиатура для создания своего шаблона меню
export const userMenuKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [{ text: '➕ Добавить ингредиент', callback_data :'user_add_ingredient' }],
      [{ text: '📝 Изменить количество', callback_data :'user_edit_ingredients' }],
      [{ text: '📦 Подтвердить заказ', callback_data :'user_confirm_order' }],
      [{ text: '⬅️ Вернуться к шаблонам', callback_data :'select_template' }]
    ]
  }
};

// Обработка подтверждения заказа
export const handleMakeOrder = async (bot, query) => {
  const chatId = query.message.chat.id;

  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });

    if (!state || !state.currentMenuId) {
      return bot.sendMessage(chatId, "❌ Нет активного шаблона");
    }

    const order = await db.Order.create({
      userId: state.userId,
      menuId: state.currentMenuId,
      submittedAt: new Date()
    });

    await bot.sendMessage(chatId, `📦 Ваша анкета #${order.id} сохраннен.`);
    await showTemplateMenu(bot, chatId);

  } catch (err) {
    console.error("Ошибка создания заказа:", err);
    await bot.sendMessage(chatId, "❌ Не удалось создать заказ");
  }
};

// Обработка выбора ингредиента для редактирования
export const handleSelectIngredientForEdit = async (bot, query) => {
  const chatId = query.message.chat.id;
  const match = query.data.match(/edit_ingredient_(\d+)/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Неизвестный ID ингредиента", true);
  }

  const ingredientId = parseInt(match[1], 10);

  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    await state.update({ editingIngredientId: ingredientId });
    await deleteMessage(bot, chatId, message_id);
    await bot.sendMessage(chatId, "🔢 Введите новое количество:");

  } catch (err) {
    console.error("Ошибка выбора ингредиента:", err);
    await bot.sendMessage(chatId, "❌ Не удалось выбрать ингредиент.");
  }
};

export const handleEditIngredients = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;

  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });

    const items = await db.MenuItem.findAll({
      where: { menuId: state.currentMenuId },
      raw: true
    });

    const ingredientIds = items.map(i => i.ingredientId);
    const ingredients = await db.Ingredient.findAll({
      where: { id: ingredientIds },
      raw: true
    });

    const keyboard = items.map(item => {
      const ing = ingredients.find(i => i.id === item.ingredientId);
      return [{
        text: `${ing?.name || 'Неизвестный ингредиент'} — ${item.requiredAmount || 0} ${ing?.unit || ''}`,
        callback_data: `edit_ingredient_${item.ingredientId}`
      }];
    });

    // ✅ ПРАВИЛЬНЫЙ ВЫЗОВ editMessageText
    await bot.editMessageText(
      "🔍 Выберите ингредиент для изменения:",
      chatId,
      message_id,
      { reply_markup: { inline_keyboard: keyboard } }
    );

  } catch (err) {
    console.error("Ошибка редактирования ингредиентов:", err);
    await bot.sendMessage(chatId, "❌ Ошибка редактирования ингредиентов.");
  }
};

export const showTemplateMenu = async (bot, chatId) => {
  try {
    const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });

    const templates = await db.Menu.findAll({
      where: {
        isTemplate: true,
        [Op.or]: [
          { ownerId: null },
          { ownerId: user.id }
        ]
      },
      raw: true
    });

    if (!templates.length) {
      return bot.sendMessage(
        chatId,
        "🍽 Шаблоны отсутствуют. Используйте команду /add_template_menu имя_шаблона"
      );
    }

    const keyboard = templates.map(template => [{
      text: template.name || `Шаблон #${template.id}`,
      callback_data:`use_template_${template.id}`
    }]);

    await bot.sendMessage(chatId, "Выберите шаблон:", {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (err) {
    console.error("Ошибка загрузки шаблонов:", err);
    await bot.sendMessage(chatId, "❌ Ошибка загрузки шаблонов.");
  }
};

export const createTemplateMenu = async (bot, msg) => {
  const chatId = msg.chat.id;
  const args = msg.text.split(' ');

  if (args.length < 2) {
    return bot.sendMessage(chatId, "Введите: /add_template_menu имя_шаблона");
  }

  const name = args[1];

  try {
    const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
    if (!user) {
      return bot.sendMessage(chatId, "❌ Пользователь не найден.");
    }

    const menu = await db.Menu.create({
      name,
      isTemplate: true,
      ownerId: user.id
    });

    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    if (!state) {
      return bot.sendMessage(chatId, "❌ Состояние пользователя не найдено.");
    }

    await state.update({ currentMenuId: menu.id });

    await bot.sendMessage(chatId, `✅ Шаблон "${name}" создан.`);
    await bot.sendMessage(chatId, "🛒 Теперь вы можете добавлять ингредиенты в этот шаблон.", userMenuKeyboard);

  } catch (err) {
    console.error("Ошибка создания шаблона:", err);
    await bot.sendMessage(chatId, "❌ Не удалось создать шаблон.");
  }
};

export const addIngredientToMenu = async (bot, query) => {
  const chatId = query.message.chat.id;
  const match = query.data.match(/add_ingredient_to_menu_(\d+)_(\d+)/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Неверный формат данных", true);
  }

  const menuId = parseInt(match[1], 10);
  const ingredientId = parseInt(match[2], 10);

  // Сохраняем выбранный ингредиент и переход к вводу количества
  const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
  await state.update({
    currentMenuId: menuId,
    editingIngredientId: ingredientId
  });

  await bot.editMessageText(
    "🔢 Введите количество ингредиента:",
    chatId,
    query.message.message_id
  );
};
export const handleSelectIngredientForMenu = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const match = query.data.match(/select_ingredient_for_menu_(\d+)_(\d+)/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Неверный формат данных", true);
  }

  const menuId = parseInt(match[1], 10);
  const ingredientId = parseInt(match[2], 10);

  try {
    // Сохраняем текущее состояние пользователя
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    await state.update({
      currentMenuId: menuId,
      editingIngredientId: ingredientId
    });

    // Удаляем старое сообщение
    await bot.deleteMessage(chatId, message_id).catch(() => {});

    // Отправляем запрос на ввод количества
    await bot.sendMessage(chatId, "🔢 Введите количество ингредиента:");

  } catch (err) {
    console.error("Ошибка выбора ингредиента:", err);
    await bot.sendMessage(chatId, "❌ Не удалось выбрать ингредиент.");
  }
};

export const handleIngredientQuantityInput = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });

    if (!state || !state.editingIngredientId || !state.currentMenuId) {
      return bot.sendMessage(chatId, "❌ Не выбран ингредиент или меню.");
    }

    const amount = parseFloat(text);
    if (isNaN(amount)) {
      return bot.sendMessage(chatId, "⚠️ Введите корректное число.");
    }

    const ingredientId = state.editingIngredientId;

    await db.MenuItem.upsert({
      menuId: state.currentMenuId,
      ingredientId,
      requiredAmount: amount
    });

    await state.update({ editingIngredientId: null });

    const ingredient = await db.Ingredient.findByPk(ingredientId, { raw: true });

    await bot.sendMessage(chatId, `✅ "${ingredient.name}" добавлен в меню — ${amount} ${ingredient.unit}`);
    await bot.sendMessage(chatId, "🛒 Меню обновлено.", userMenuKeyboard);

  } catch (err) {
    console.error("Ошибка ввода количества:", err);
    await bot.sendMessage(chatId, "❌ Не удалось обновить количество.");
  }
};

export const showCategories = async (bot, chatId) => {
  try {
    const categories = await db.Ingredient.findAll({
      attributes: ['category'],
      group: ['category']
    });

    const keyboard = categories.map(cat => [{
      text: cat.category,
      callback_data:`select_category_${cat.category}`
    }]);

    keyboard.push([{ text: '⬅️ Назад', callback_data:'select_template' }]);

    await bot.sendMessage(chatId, "📂 Выберите категорию:", {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (err) {
    console.error("Ошибка отображения категорий:", err);
    await bot.sendMessage(chatId, "❌ Ошибка при загрузке категорий.");
  }
};

export const selectCategory = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const match = query.data.match(/select_category_(.+)/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Категория не найдена", true);
  }

  const category = decodeURIComponent(match[1]);

  try {
    const ingredients = await db.Ingredient.findAll({ where: { category }, raw: true });

    if (!ingredients.length) {
      return bot.sendMessage(chatId, "❌ В этой категории нет ингредиентов.");
    }

    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });

    if (!state || !state.currentMenuId) {
      return bot.sendMessage(chatId, "❌ Не выбрано меню.");
    }

    const keyboard = ingredients.map(ingredient => [{
      text: `${ingredient.name} — ${ingredient.unit}`,
      callback_data:`select_ingredient_for_menu_${state.currentMenuId}_${ingredient.id}`
    }]);

    // ❌ Удаляем старое сообщение
    await bot.deleteMessage(chatId, message_id).catch(() => {});

    // ✅ Отправляем новое с клавиатурой
    await bot.sendMessage(chatId, `🔍 Ингредиенты из категории "${category}":`, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (err) {
    console.error("Ошибка выбора категории:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить ингредиенты.");
  }
};

export const handleUseTemplate = async (bot, query) => {
  const chatId = query.message.chat.id;
  const message_id = query.message.message_id;
  const match = query.data.match(/use_template_(\d+)/);

  if (!match) {
    return bot.answerCallbackQuery(query.id, "⚠️ Неверный ID шаблона", true);
  }

  const templateId = parseInt(match[1], 10);

  try {
    const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });

    if (!user) {
      return bot.sendMessage(chatId, "❌ Пользователь не найден");
    }

    const template = await db.Menu.findByPk(templateId);

    if (!template) {
      return bot.sendMessage(chatId, "❌ Шаблон не найден");
    }

    let menuId;

    // Если шаблон чужой — создаём копию
    if (!template.ownerId || template.ownerId !== user.id) {
      const newMenu = await db.Menu.create({
        name: `${template.name} (ваша копия)`,
        isTemplate: false,
        owner_id: user.id // ✅ Теперь точно есть id
      });

      const originalItems = await db.MenuItem.findAll({ where: { menuId: template.id }, raw: true });

      const copiedItems = originalItems.map(item => ({
        menuId: newMenu.id,
        ingredientId: item.ingredientId,
        requiredAmount: item.requiredAmount
      }));

      await db.MenuItem.bulkCreate(copiedItems);
      menuId = newMenu.id;
    } else {
      menuId = template.id;
    }

    // Сохраняем состояние
    const [state] = await db.UserState.findOrCreate({
      where: { telegramId: chatId.toString() },
      defaults: {
        telegramId: chatId.toString(),
        currentMenuId: menuId
      }
    });

    if (!state.currentMenuId || state.currentMenuId !== menuId) {
      await state.update({ currentMenuId: menuId });
    }

    const items = await db.MenuItem.findAll({ where: { menuId }, raw: true });
    const ingredientIds = items.map(i => i.ingredientId);
    const ingredients = await db.Ingredient.findAll({ where: { id: ingredientIds }, raw: true });

    const message = `🛒 Ингредиенты шаблона "${template.name}":\n\n` +
      items.map(item => {
        const ing = ingredients.find(i => i.id === item.ingredientId);
        return `${ing?.name || 'Неизвестный ингредиент'} — ${item.requiredAmount || 0} ${ing?.unit || ''}`;
      }).join('\n');

    // Удаляем старое сообщение
    await bot.deleteMessage(chatId, message_id).catch(() => {});

    // Отправляем новое с клавиатурой
    await bot.sendMessage(chatId, message, userMenuKeyboard);

  } catch (err) {
    console.error("Ошибка при выборе шаблона:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить шаблон.");
  }
};