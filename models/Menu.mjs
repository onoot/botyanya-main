export default (sequelize, DataTypes) => {
    const Menu = sequelize.define('Menu', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        isTemplate: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        ownerId: DataTypes.INTEGER,
    }, {
        tableName: 'Menus',
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        timestamps: true,
        underscored: true
    });

    return Menu;
};