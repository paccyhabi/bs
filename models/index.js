const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/dbconfig');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
    host: dbConfig.HOST,
    dialect: dbConfig.dialect
});

sequelize.authenticate()
    .then(() => {
        console.log('Connection successful.');
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.routes = require('./routeModel.js')(sequelize, DataTypes);
db.tickets = require('./ticketModel.js')(sequelize, DataTypes);
db.users = require('./userModel.js')(sequelize, DataTypes);

db.users.hasMany(db.tickets, {
    foreignKey: 'user_id',
    as: 'tickets'
});
db.tickets.belongsTo(db.users, {
    foreignKey: 'user_id',
    as: 'user'
});

db.routes.hasMany(db.tickets,{
    foreignKey:'route_id',
    as:'tickets'
});

db.tickets.belongsTo(db.routes,{
    foreignKey: 'route_id',
    as:'route'
});


// Sync Models
db.sequelize.sync({ force: false })
    .then(() => {
        console.log('Database synchronized successfully.');
    })
    .catch(err => {
        console.error('Error synchronizing the database:', err);
    });

module.exports = db;
