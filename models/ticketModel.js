module.exports = (sequelize, DataTypes) => {
    const Ticket = sequelize.define('ticket', {
        purchase_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });
    return Ticket;
};
