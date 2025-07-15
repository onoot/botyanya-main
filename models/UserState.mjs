export default (sequelize, DataTypes) => {
    const UserState = sequelize.define('UserState', {
        telegramId: {
            type: DataTypes.STRING,
            unique: true
        }, 
        userId: DataTypes.INTEGER,
        currentMenuId: DataTypes.INTEGER,
        editingIngredientId: DataTypes.INTEGER,
        step: DataTypes.STRING,
        notificationTime: {
            type: DataTypes.STRING,
            defaultValue: '09:00'
        }
        
    }, {
        tableName: 'UserStates',
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        underscored: true
    });

    return UserState;
};