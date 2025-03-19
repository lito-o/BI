const { Sequelize } = require("sequelize");
require("dotenv").config();

// Создаём подключение к PostgreSQL
const db = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASS, 
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    port: process.env.DB_PORT,
    logging: false, // Отключаем логи запросов в консоли
  }
);

module.exports = db;