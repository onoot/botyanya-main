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
        unit: DataTypes.STRING,
        category: DataTypes.STRING
    }, {
        tableName: 'Ingredients',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        timestamps: true,
        underscored: true
    });

    return Ingredient;
};