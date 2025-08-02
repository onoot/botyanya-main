// models/UserState.mjs
export default (sequelize, DataTypes) => {
  const UserState = sequelize.define('UserState', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    telegramId: {
      type: DataTypes.STRING,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    currentMenuId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    editingIngredientId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    step: {
      type: DataTypes.STRING,
      allowNull: true
    },
    notificationTime: {
      type: DataTypes.STRING,
      defaultValue: '09:00'
    },
    currentOrder: {
      type: DataTypes.JSON,
      defaultValue: {}
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