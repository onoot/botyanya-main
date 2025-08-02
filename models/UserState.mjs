export default (sequelize, DataTypes) => {
  const UserState = sequelize.define('UserState', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    telegramId: {
      type: DataTypes.STRING,
      unique: true,
      field: 'telegram_id' // Явно указываем соответствие с БД
    },
    userId: { 
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'user_id' 
    },
    currentMenuId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'current_menu_id'
    },
    editingIngredientId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'editing_ingredient_id'
    },
    step: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notificationTime: {
      type: DataTypes.STRING,
      defaultValue: '09:00',
      field: 'notification_time'
    },
    currentOrder: {
      type: DataTypes.JSON,
      defaultValue: {},
      field: 'current_order'
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'UserStates',
    timestamps: true,
    underscored: true
  });

  return UserState;
};