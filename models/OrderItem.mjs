export default (sequelize, DataTypes) => {
    const OrderItem = sequelize.define('OrderItem', {
        orderId: DataTypes.INTEGER,
        amount: DataTypes.FLOAT
    }, {
        tableName: 'OrderItems',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    return OrderItem;
};