// models/index.mjs
import { Sequelize } from 'sequelize';
import userModel from './User.mjs';
import userStateModel from './UserState.mjs';
import ingredientModel from './Ingredient.mjs';
import menuModel from './Menu.mjs';
import menuItemModel from './MenuItem.mjs';

import dotenv from 'dotenv';
dotenv.config();

// Подключение к БД
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ingredient_bot',
  define: {
    underscored: true,
    freezeTableName: true,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
    engine: 'InnoDB'
  },
  logging: false
});

const DataTypes = sequelize.Sequelize.DataTypes;

// Инициализация моделей
const models = {
  User: userModel(sequelize, DataTypes),
  UserState: userStateModel(sequelize, DataTypes),
  Ingredient: ingredientModel(sequelize, DataTypes),
  Menu: menuModel(sequelize, DataTypes),
  MenuItem: menuItemModel(sequelize, DataTypes)
};

export default {
  sequelize,
  ...models
};