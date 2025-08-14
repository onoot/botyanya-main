// controllers/userController.mjs
import db from '../models/index.mjs';
import {sendOrEditMessage} from '../utils/botUtils.mjs'

export const showCategoriesMenu = async (bot, chatId) => {
  try {
    // Получаем уникальные категории из БД
    const categories = await db.Ingredient.findAll({
      attributes: [
        [db.sequelize.fn('DISTINCT', db.sequelize.col('category')), 'category']
      ],
      raw: true
    });

    // Проверяем, есть ли категории
    if (!categories || categories.length === 0) {
      return sendOrEditMessage(bot, chatId, "❌ Категории отсутствуют. Админ должен добавить ингредиенты.");
    }

    // Формируем клавиатуру
    const keyboard = categories.map(category => [{
      text: category.category || 'Без категории',
      callback_data: `category_${category.category || 'main_menu'}`
    }]);

    // Добавляем кнопку "Назад"
    keyboard.push([{ text: '⬅️ Назад', callback_data: 'main_menu' }]);

    await sendOrEditMessage(bot, chatId, "Выберите категорию:", {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка загрузки категорий:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось загрузить категории.");
  }
};

export const showIngredientsInCategory = async (bot, chatId, category) => {
  try {
    const ingredients = await db.Ingredient.findAll({ 
      where: { category }, 
      raw: true 
    });

    if (!ingredients.length) {
      return sendOrEditMessage(bot, chatId, "❌ В этой категории нет ингредиентов.");
    }

    const keyboard = ingredients.map(ingredient => [{
      text: `${ingredient.name || 'Неизвестный'} (${ingredient.packaging_amount || 1} ${ingredient.unit || 'ед'})`,
      callback_data: `ingredient_${ingredient.id}`
    }]);

    keyboard.push(
      [{ text: '📝 Комментарий к заказу', callback_data: 'enter_comment' }],
      [{ text: '⬅️ Назад', callback_data: 'make_order' }]
    );

    await sendOrEditMessage(bot, chatId, `Ингредиенты в категории "${category}":`, {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка загрузки ингредиентов:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось загрузить ингредиенты.");
  }
};

export const showIngredientQuantityOptions = async (bot, chatId, ingredientId) => {
  try {
    // 1. Находим пользователя
    const user = await db.User.findOne({ 
      where: { telegramId: chatId.toString() } 
    });
    if (!user) {
      return sendOrEditMessage(bot, chatId, "❌ Пользователь не найден.");
    }
    
    // 2. Ищем состояние по telegramId
    let state = await db.UserState.findOne({ 
      where: { telegramId: chatId.toString() } 
    });

    // 3. Если найдено, но userId не установлен — обновляем
    if (state && !state.userId) {
      await state.update({ userId: user.id });
    }
    // 4. Если не найдено — создаём
    else if (!state) {
      state = await db.UserState.create({
        telegramId: chatId.toString(),
        userId: user.id,
        currentOrder: {},
        comment: null,
        step: null
      });
    }
    
    if (!state) {
      return sendOrEditMessage(bot, chatId, "❌ Не удалось создать состояние пользователя.");
    }
    
    const ingredient = await db.Ingredient.findByPk(ingredientId, { raw: true });
    if (!ingredient) {
      return sendOrEditMessage(bot, chatId, "❌ Ингредиент не найден.");
    }
    
    const options = [];
    const min_order = ingredient.min_order || 1;
    const max_order = ingredient.max_order || 100;
    const packaging_amount = ingredient.packaging_amount || 1;
    
    let amount = min_order;
    while (amount <= max_order) {
      options.push(amount);
      amount += packaging_amount;
    }
    
    const keyboard = [
      // Кнопки количества — одна строка
      options.map(amount => ({
        text: amount.toString(),
        callback_data: `quantity_${ingredientId}_${amount}`
      }))
    ];
    
    // ✅ Правильно: одна строка с одной кнопкой
    keyboard.push([
      { text: '⬅️ Назад', callback_data: `category_${ingredient.category || 'main_menu'}` }
    ]);
    
    await sendOrEditMessage(bot, chatId, `Выберите количество для "${ingredient.name || 'Неизвестный'}" (макс. ${max_order} ${ingredient.unit || 'ед'}):`, { 
      reply_markup: { inline_keyboard: keyboard } 
    });
  } catch (err) {
    console.error("Ошибка отображения вариантов количества:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось загрузить варианты количества.");
  }
};

export const enterCommentMode = async (bot, chatId) => {
  try {
    // 1. Находим пользователя
    const user = await db.User.findOne({ 
      where: { telegramId: chatId.toString() } 
    });
    
    if (!user) {
      return sendOrEditMessage(bot, chatId, "❌ Пользователь не найден.");
    }

    // 2. Ищем состояние по telegramId
    let state = await db.UserState.findOne({ 
      where: { telegramId: chatId.toString() } 
    });

    // 3. Если найдено, но userId не установлен — обновляем
    if (state && !state.userId) {
      await state.update({ userId: user.id });
    }
    // 4. Если не найдено — создаём
    else if (!state) {
      state = await db.UserState.create({
        telegramId: chatId.toString(),
        userId: user.id,
        currentOrder: {},
        comment: null,
        step: null
      });
    }

    if (!state) {
      return sendOrEditMessage(bot, chatId, "❌ Не удалось создать состояние пользователя.");
    }

    // Устанавливаем шаг для обработки следующего сообщения
    await state.update({ step: 'entering_comment' });

    const keyboard = [[{ text: '❌Отмена', callback_data: 'main_menu' }]];

    await sendOrEditMessage(bot, chatId, "📝 Введите комментарий к заказу:", {
      reply_markup: { inline_keyboard: keyboard }
    });
  } catch (err) {
    console.error("Ошибка перехода в режим комментария:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось перейти в режим комментария.");
  }
};

/**
 * Режим редактирования комментария
 */
export const editCommentMode = async (bot, chatId) => {
  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    if (!state) {
      return sendOrEditMessage(bot, chatId, "❌ Ошибка: состояние не найдено.");
    }

    // Устанавливаем шаг для редактирования
    await state.update({ step: 'editing_comment' });

    const keyboard = [
      [{ text: '❌ Отмена', callback_data: 'main_menu' }]
    ];

    await sendOrEditMessage(bot, chatId, `✏ Введите новый комментарий (старый: "${state.comment || 'отсутствует'}")`, {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка перехода в режим редактирования комментария:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось перейти в режим редактирования.");
  }
};

/**
 * Удаление комментария
 */
export const deleteComment = async (bot, chatId) => {
  try {
    const state = await db.UserState.findOne({ where: { telegramId: chatId.toString() } });
    if (!state) {
      return sendOrEditMessage(bot, chatId, "❌ Ошибка: состояние не найдено.");
    }

    await state.update({ comment: null });

    // Показываем обновлённый список выбранных ингредиентов
    const order = state.currentOrder || {};
    const ingredientIds = Object.keys(order).map(id => parseInt(id));

    const ingredients = await db.Ingredient.findAll({
      where: { id: ingredientIds },
      raw: true
    });

    let message = "✅ Выбрано:\n";
    
    for (const [id, qty] of Object.entries(order)) {
      const ing = ingredients.find(i => i.id === parseInt(id));
      if (ing) {
        message += `• ${ing.name} — ${qty} ${ing.unit}\n`;
      } else {
        message += `• Неизвестный ингредиент (ID: ${id}) — ${qty} ед\n`;
      }
    }

    message += "\n💬 Комментарий удалён.";

    const keyboard = [
      [
        { text: '👩‍🍳 Отправить заявку', callback_data: 'submit_order' }
      ],
      [
        { text: '➕ Добавить еще', callback_data: 'make_order' },
        { text: '⬅️ Назад', callback_data: 'main_menu' }
      ],
      [
        { text: '💬 Добавить комментарий', callback_data: 'enter_comment' }
      ],
    ];

    await sendOrEditMessage(bot, chatId, message, {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка удаления комментария:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось удалить комментарий.");
  }
};

export const handleQuantitySelection = async (bot, chatId, ingredientId, amount) => {
  try {
    // 1. Находим пользователя
    const user = await db.User.findOne({ 
      where: { telegramId: chatId.toString() } 
    });
    
    if (!user) {
      return sendOrEditMessage(bot, chatId, "❌ Пользователь не найден.");
    }

    // 2. Ищем состояние по telegramId
    let state = await db.UserState.findOne({ 
      where: { telegramId: chatId.toString() } 
    });

    // 3. Если состояние найдено, но userId не установлен — обновляем
    if (state && !state.userId) {
      await state.update({ userId: user.id });
    }
    // 4. Если не найдено — создаём новое
    else if (!state) {
      state = await db.UserState.create({
        telegramId: chatId.toString(),
        userId: user.id,
        currentOrder: {},
        comment: null,
        step: null
      });
    }

    if (!state) {
      return sendOrEditMessage(bot, chatId, "❌ Не удалось создать состояние пользователя.");
    }

    const ingredient = await db.Ingredient.findByPk(ingredientId);
    if (!ingredient) {
      return sendOrEditMessage(bot, chatId, "❌ Ингредиент не найден.");
    }

    // 5. Копируем текущий заказ
    const currentOrder = JSON.parse(JSON.stringify(state.currentOrder || {}));

    // 6. Добавляем ингредиент
    currentOrder[ingredientId] = parseFloat(amount);

    // 7. Сохраняем
    await state.update({ currentOrder });

    // 8. Получаем свежее состояние
    const freshState = await db.UserState.findOne({ 
      where: { telegramId: chatId.toString() } 
    });

    // ✅ 9. Формируем полный список выбранных ингредиентов
    const order = freshState.currentOrder || {};
    const ingredientIds = Object.keys(order).map(id => parseInt(id));

    // Получаем сами ингредиенты из БД
    const ingredients = await db.Ingredient.findAll({
      where: { id: ingredientIds },
      raw: true
    });

    // Формируем сообщение
    let message = "✅ Выбрано:\n";
    
    for (const [id, qty] of Object.entries(order)) {
      const ing = ingredients.find(i => i.id === parseInt(id));
      if (ing) {
        message += `• ${ing.name} — ${qty} ${ing.unit}\n`;
      } else {
        message += `• Неизвестный ингредиент (ID: ${id}) — ${qty} ед\n`;
      }
    }
     if (freshState?.dataValues?.comment) {
      message += `\n💬 Ваш комментарий: ${freshState.comment}`;
    }
    // ✅ 10. Кнопки: "Отправить", "Добавить еще", "Назад"
    const keyboard = [
      [
        { text: '👩‍🍳 Отправить заявку', callback_data: 'submit_order' }
      ],
      [
        { text: '➕ Добавить еще', callback_data: 'make_order' },
        { text: '⬅️ Назад', callback_data: 'main_menu' }
      ],
      [
        { text: '💬Комментарий к заказу', callback_data: 'enter_comment' }
      ],
    ];

    // ✅ 11. Отправляем сообщение с полным списком
    await sendOrEditMessage(bot, chatId, message, {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка выбора количества:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось обновить количество.");
  }
};

export const submitOrder = async (bot, chatId) => {
  try {
    // 1. Находим пользователя
    const user = await db.User.findOne({ 
      where: { telegramId: chatId.toString() } 
    });
    
    if (!user) {
      return sendOrEditMessage(bot, chatId, "❌ Пользователь не найден.");
    }

    // 2. Ищем состояние по telegramId
    let state = await db.UserState.findOne({ 
      where: { telegramId: chatId.toString() } 
    });

    // 3. Если найдено, но userId не установлен — обновляем
    if (state && !state.userId) {
      await state.update({ userId: user.id });
    }
    // 4. Если не найдено — создаём
    else if (!state) {
      state = await db.UserState.create({
        telegramId: chatId.toString(),
        userId: user.id,
        currentOrder: {},
        comment: null,
        step: null
      });
    }

    if (!state) {
      return sendOrEditMessage(bot, chatId, "❌ Не удалось создать состояние пользователя.");
    }

    // 5. ПОЛНОСТЬЮ КОПИРУЕМ текущий заказ
    const currentOrder = JSON.parse(JSON.stringify(state.currentOrder || {}));
    
    if (Object.keys(currentOrder).length === 0) {
      return sendOrEditMessage(bot, chatId, "❌ Ваш заказ пустой.");
    }

    // ✅ 1. Подготавливаем данные для записи MenuItem
    const items = [];
    
    // Преобразуем объект currentOrder в массив объектов { id, quantity }
    for (const [ingredientId, quantity] of Object.entries(currentOrder)) {
      const id = Number(ingredientId);
      if (!isNaN(id) && id > 0) {
        items.push({
          id: id,
          quantity: parseFloat(quantity)
        });
      }
    }
    
    // Проверяем, что у нас есть ингредиенты для сохранения
    if (items.length === 0) {
      return sendOrEditMessage(bot, chatId, "❌ Не удалось сохранить заказ: все ингредиенты некорректны.");
    }
    
    // ✅ 2. Создаем запись MenuItem
    const menuItem = await db.MenuItem.create({
      ingredientId: items
    });
    
    if (!menuItem || !menuItem.id) {
      throw new Error("Не удалось создать элемент меню");
    }
    
    // ✅ 3. Создаем сам заказ (Menu) с указанием ID MenuItem в поле is_template
    const newOrder = await db.Menu.create({
      name: `Заказ от ${new Date().toLocaleDateString()}`,
      comment: state.comment || null,
      is_template: menuItem.id,  // Сохраняем ID MenuItem здесь
      owner_id: user.id
    });

    if (!newOrder || !newOrder.id) {
      // Если заказ не создан, удаляем созданный MenuItem
      await menuItem.destroy();
      throw new Error("Не удалось создать заказ");
    }
    
    // ✅ 4. Очищаем состояние
    await state.update({
      currentMenuId: newOrder.id,
      currentOrder: {}, // очищаем выбранные ингредиенты
      comment: null,
      step: null
    });
    
    // ✅ 5. Формируем текст заказа
    // Извлекаем ID ингредиентов из массива items
    const ingredientIds = items.map(item => item.id);
    
    const ingredients = await db.Ingredient.findAll({
      where: { id: ingredientIds },
      raw: true
    });
    
    let orderText = `📦 Новый заказ от ${user.username ? `@${user.username}` : user.telegramId} (ID: ${newOrder.id}):\n\n`;
    
    // Используем данные из массива items
    for (const item of items) {
      const ingredient = ingredients.find(ing => ing.id === item.id);
      if (ingredient) {
        orderText += `• ${ingredient.name} — ${item.quantity} ${ingredient.unit}\n`;
      } else {
        orderText += `• Неизвестный ингредиент (ID: ${item.id}) — ${item.quantity}\n`;
      }
    }
    
    if (state.comment) {
      orderText += `\n💬 Комментарий: ${state.comment}`;
    }
    
    // ✅ 6. Отправляем админам
    const admins = await db.User.findAll({ where: { role: 'admin' } });
    for (const admin of admins) {
      try {
        await bot.sendMessage(admin.telegramId, orderText);
      } catch (err) {
        console.error(`Не удалось отправить админу ${admin.telegramId}:`, err.message);
      }
    }
    
    // ✅ 7. Подтверждение пользователю
    const keyboard = {
      reply_markup: {
        inline_keyboard: [[{ text: '🍱 Главная', callback_data: 'main_menu' }]]
      }
    };
    await sendOrEditMessage(bot, chatId, "✅ Ваш заказ успешно отправлен и сохранён!", keyboard);
  } catch (err) {
    console.error("Ошибка отправки заказа:", err);
    await sendOrEditMessage(bot, chatId, "❌ Не удалось отправить заказ.");
  }
};