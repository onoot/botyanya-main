export default (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        telegramId: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        firstName: DataTypes.STRING,
        lastName: DataTypes.STRING,
        username: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        isRegistered: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user'
        }
    }, {
        tableName: 'Users',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        timestamps: true,
        underscored: true
    });

    return User;
};