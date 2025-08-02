// models/MenuItem.mjs
export default (sequelize, DataTypes) => {
  const MenuItem = sequelize.define('MenuItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    ingredientId: {
      type: DataTypes.JSON,
      allowNull: false,
      default: []
    },
  }, {
    tableName: 'MenuItems',
    timestamps: true,
    underscored: true
  });

  return MenuItem;
};