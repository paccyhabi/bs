module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        phone_number: {
            type: DataTypes.STRING,
            allowNull: false
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false
        },
        sessionId:{
            type: DataTypes.STRING,
        },
        serviceCode: {   
            type: DataTypes.STRING,
        }

    });
    return User;
};
