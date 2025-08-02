// controllers/userController.mjs
import db from '../models/index.mjs';

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
      return bot.sendMessage(chatId, "❌ Категории отсутствуют. Админ должен добавить ингредиенты.");
    }

    // Формируем клавиатуру
    const keyboard = categories.map(category => [{
      text: category.category || 'Без категории',
      callback_data: `category_${category.category || 'main_menu'}`
    }]);

    // Добавляем кнопку "Назад"
    keyboard.push([{ text: '⬅️ Назад', callback_data: 'main_menu' }]);

    await bot.sendMessage(chatId, "Выберите категорию:", {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка загрузки категорий:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить категории.");
  }
};

export const showIngredientsInCategory = async (bot, chatId, category) => {
  try {
    const ingredients = await db.Ingredient.findAll({ 
      where: { category }, 
      raw: true 
    });

    if (!ingredients.length) {
      return bot.sendMessage(chatId, "❌ В этой категории нет ингредиентов.");
    }

    const keyboard = ingredients.map(ingredient => [{
      text: `${ingredient.name || 'Неизвестный'} (${ingredient.packaging_amount || 1} ${ingredient.unit || 'ед'})`,
      callback_data: `ingredient_${ingredient.id}`
    }]);

    keyboard.push(
      [{ text: '📝 Комментарии', callback_data: 'enter_comment' }],
      [{ text: '⬅️ Назад', callback_data: 'make_order' }]
    );

    await bot.sendMessage(chatId, `Ингредиенты в категории "${category}":`, {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка загрузки ингредиентов:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить ингредиенты.");
  }
};

export const showIngredientQuantityOptions = async (bot, chatId, ingredientId) => {
  try {
    const ingredient = await db.Ingredient.findByPk(ingredientId, { raw: true });

    if (!ingredient) {
      return bot.sendMessage(chatId, "❌ Ингредиент не найден.");
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
      options.map(amount => ({
        text: amount.toString(),
        callback_data: `quantity_${ingredientId}_${amount}`
      }))
    ];

    keyboard.push([
      { text: '⬅️ Назад', callback_data: `category_${ingredient.category || 'main_menu'}` }
    ]);

    await bot.sendMessage(chatId, `Выберите количество для "${ingredient.name || 'Неизвестный'}" (макс. ${max_order} ${ingredient.unit || 'ед'}):`, { 
      reply_markup: { inline_keyboard: keyboard } 
    });

  } catch (err) {
    console.error("Ошибка отображения вариантов количества:", err);
    await bot.sendMessage(chatId, "❌ Не удалось загрузить варианты количества.");
  }
};

export const handleQuantitySelection = async (bot, chatId, ingredientId, amount) => {
  try {
    const [state] = await db.UserState.findOrCreate({
      where: { telegramId: chatId.toString() },
      defaults: {
        telegramId: chatId.toString(),
        currentOrder: {}, // ✅ объект
        comment: null,
        step: null
      }
    });

    if (!state) {
      return bot.sendMessage(chatId, "❌ Не удалось создать состояние пользователя.");
    }

    const ingredient = await db.Ingredient.findByPk(ingredientId);
    if (!ingredient) {
      return bot.sendMessage(chatId, "❌ Ингредиент не найден.");
    }

    // ✅ Берём текущий заказ
    const currentOrder = state.currentOrder || {};

    // ✅ Добавляем выбранный ингредиент
    currentOrder[ingredientId] = parseFloat(amount);

    // ✅ Сохраняем обновлённый заказ
    await state.update({ currentOrder });

    // ✅ Клавиатура
    const keyboard = [
      [
        { text: '👩‍🍳 Отправить заявку', callback_data: 'submit_order' },
        { text: '⬅️ Назад', callback_data: `category_${ingredient.category || 'main_menu'}` }
      ]
    ];

    await bot.sendMessage(chatId, `✅ Выбрано: ${ingredient.name} — ${amount} ${ingredient.unit}`, {
      reply_markup: { inline_keyboard: keyboard }
    });

  } catch (err) {
    console.error("Ошибка выбора количества:", err);
    await bot.sendMessage(chatId, "❌ Не удалось обновить количество.");
  }
};

export const enterCommentMode = async (bot, chatId) => {
  try {
    // Создаём состояние, если его нет
    const [state] = await db.UserState.findOrCreate({
      where: { telegramId: chatId.toString() },
      defaults: {
        telegramId: chatId.toString(),
        currentOrder: JSON.stringify({}),
        comment: null,
        step: null
      }
    });

    if (!state) {
      return bot.sendMessage(chatId, "❌ Не удалось создать состояние пользователя.");
    }

    await state.update({ step: 'entering_comment' });
    await bot.sendMessage(chatId, "Введите комментарий к заказу:");
    
  } catch (err) {
    console.error("Ошибка перехода в режим комментария:", err);
    await bot.sendMessage(chatId, "❌ Не удалось перейти в режим комментария.");
  }
};

export const submitOrder = async (bot, chatId) => {
  try {
    const [state] = await db.UserState.findOrCreate({
      where: { telegramId: chatId.toString() },
      defaults: {
        telegramId: chatId.toString(),
        currentOrder: {},
        comment: null,
        step: null
      }
    });

    if (!state) {
      return bot.sendMessage(chatId, "❌ Не удалось создать состояние пользователя.");
    }

    const user = await db.User.findOne({ where: { telegramId: chatId.toString() } });
    if (!user) {
      return bot.sendMessage(chatId, "❌ Пользователь не найден.");
    }

    const order = state.currentOrder || {};
    if (Object.keys(order).length === 0) {
      return bot.sendMessage(chatId, "❌ Ваш заказ пустой.");
    }

    // ✅ 1. Создаём сам заказ (Menu)
    const newOrder = await db.Menu.create({
      name: `Заказ от ${new Date().toLocaleDateString()}`,
      comment: state.comment || null,
      is_template: false,
      owner_id: user.id
    });

    // ✅ 2. Подготавливаем элементы заказа (MenuItem)
    const menuItems = Object.entries(order).map(([ingredientId, quantity]) => ({
      menu_id: newOrder.id,
      ingredient_id: parseInt(ingredientId),
      required_amount: parseFloat(quantity)
    }));

    // ✅ 3. Сохраняем элементы заказа
    await db.MenuItem.bulkCreate(menuItems);

    // ✅ 4. Очищаем состояние
    await state.update({
      currentMenuId: newOrder.id,
      currentOrder: {}, // очищаем выбранные ингредиенты
      comment: null,
      step: null
    });

    // ✅ 5. Формируем текст заказа
    const ingredientIds = Object.keys(order).map(id => parseInt(id));
    const ingredients = await db.Ingredient.findAll({
      where: { id: ingredientIds },
      raw: true
    });

    let orderText = `📦 Новый заказ от ${user.username ? `@${user.username}` : user.telegramId} (ID: ${newOrder.id}):\n\n`;
    for (const [ingredientId, quantity] of Object.entries(order)) {
      const ingredient = ingredients.find(ing => ing.id === parseInt(ingredientId));
      if (ingredient) {
        orderText += `• ${ingredient.name} — ${quantity} ${ingredient.unit}\n`;
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
    await bot.sendMessage(chatId, "✅ Ваш заказ успешно отправлен и сохранён!", keyboard);

  } catch (err) {
    console.error("Ошибка отправки заказа:", err);
    await bot.sendMessage(chatId, "❌ Не удалось отправить заказ.");
  }
};