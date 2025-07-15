export default (sequelize, DataTypes) => {
    const Order = sequelize.define('Order', {
        userId: DataTypes.INTEGER,
        menuId: DataTypes.INTEGER,
        submittedAt: DataTypes.DATE
    }, {
        tableName: 'Orders',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    return Order;
};