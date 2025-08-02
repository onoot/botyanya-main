// models/MenuItem.mjs
export default (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    menuId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ingredientId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    requiredAmount: {
      type: DataTypes.FLOAT,
      allowNull: false
    }
  }, {
    tableName: 'MenuItems',
    timestamps: true,
    underscored: true
  });

  return MenuItem;
};