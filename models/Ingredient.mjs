// models/Ingredient.mjs
export default (sequelize, DataTypes) => {
  const Ingredient = sequelize.define('Ingredient', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    packaging: {
      type: DataTypes.STRING,
      allowNull: true
    },
    packaging_amount: {
      type: DataTypes.FLOAT,
      defaultValue: 1
    },
    min_order: {
      type: DataTypes.FLOAT,
      defaultValue: 1
    },
    max_order: {
      type: DataTypes.FLOAT,
      defaultValue: 1000
    }
  }, {
    tableName: 'Ingredients',
    timestamps: true,
    underscored: true
  });

  return Ingredient;
};