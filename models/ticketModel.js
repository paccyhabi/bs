module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define('ticket', {
        purchase_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull:false 
        }
    });
    return Ticket;
};
