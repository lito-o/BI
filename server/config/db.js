const { Sequelize } = require("sequelize");

// Подключение к базе PostgreSQL
const db = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: "postgres",
  logging: false, // Отключаем логи SQL-запросов
});

module.exports = db;
