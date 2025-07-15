// models/index.mjs
import { Sequelize } from 'sequelize';
import userModel from './User.mjs';
import ingredientModel from './Ingredient.mjs';
import menuModel from './Menu.mjs';
import orderModel from './Order.mjs';
import menuItemModel from './MenuItem.mjs';    
import orderItemModel from './OrderItem.mjs';  
import userStateModel from './UserState.mjs';

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
  UserState: userStateModel(sequelize, DataTypes),
  User: userModel(sequelize, DataTypes),
  Ingredient: ingredientModel(sequelize, DataTypes),
  Menu: menuModel(sequelize, DataTypes),
  Order: orderModel(sequelize, DataTypes),
  MenuItem: menuItemModel(sequelize, DataTypes),   
  OrderItem: orderItemModel(sequelize, DataTypes)  
};


// Ассоциации
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

export default {
  sequelize,
  ...models
};