module.exports = (sequelize, DataTypes) => {
  const Route = sequelize.define('route', {
      start_location: {
          type: DataTypes.STRING,
          allowNull: false
      },
      end_location: {
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
