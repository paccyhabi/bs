module.exports = (sequelize, DataTypes) => {
  const Route = sequelize.define('route', {
      route_name: {
          type: DataTypes.STRING,
          allowNull: false
      },
      fare: {
          type: DataTypes.DECIMAL,
          allowNull: false
      },
      available_seats: {
          type: DataTypes.INTEGER,
          allowNull: false
      }
  });
  return Route;
};
