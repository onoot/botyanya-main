// models/User.mjs
export default (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    telegramId: {
      type: DataTypes.STRING,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      unique: true
    },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    role: {
      type: DataTypes.STRING,
      defaultValue: 'user'
    },
    isRegistered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'Users',
    timestamps: true,
    underscored: true
  });

  return User;
};