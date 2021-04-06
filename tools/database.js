const {Sequelize} = require('sequelize');
const config = require("../config.json");   
const sequelize = new Sequelize(config.dbName, config.dbUsername, config.dbPassword, {
  host: config.dbHost,
  dialect: 'mariadb',
});
try {
  sequelize.authenticate();
  console.log('Connection has been established successfully.');
} catch (error) {
  console.error('Unable to connect to the database:', error);
}

module.exports = sequelize;
