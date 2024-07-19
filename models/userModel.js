module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        phone_number: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }
    });
    return User;
};
