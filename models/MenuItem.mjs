export default (sequelize, DataTypes) => {
    const MenuItem = sequelize.define('MenuItem', {
        menuId: DataTypes.INTEGER,
        ingredientId: DataTypes.INTEGER,
        requiredAmount: DataTypes.FLOAT
    }, {
        tableName: 'MenuItems',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    return MenuItem;
};