// models/Menu.mjs
export default (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_template: {
      type: DataTypes.INTEGER,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'Menus',
    timestamps: true,
    underscored: true
  });

  return Menu;
};