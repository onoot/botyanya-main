import db from '../models/index.mjs';

export const getMenuForToday = async () => {
  try {
    const [results] = await db.sequelize.query(`
      SELECT 
        m.id AS menu_id,
        m.name AS menu_name,
        i.id AS ingredient_id,
        i.name AS ingredient_name,
        i.unit AS ingredient_unit,
        mi.required_amount
      FROM Menus m
      JOIN MenuItems mi ON m.id = mi.menu_id
      JOIN Ingredients i ON i.id = mi.ingredient_id
      WHERE m.is_template = true AND m.owner_id IS NULL;
    `);

    if (!results.length) return null;

    return {
      id: results[0].menu_id,
      name: results[0].menu_name,
      items: results.map(row => ({
        ingredientName: row.ingredient_name,
        ingredientUnit: row.ingredient_unit,
        requiredAmount: row.required_amount
      }))
    };

  } catch (err) {
    console.error("Ошибка SQL-запроса:", err.message);
    return null;
  }
};