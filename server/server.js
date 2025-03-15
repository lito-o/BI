require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Настройки
app.use(cors()); // Разрешаем CORS
app.use(express.json()); // Разбираем JSON в запросах
app.use(morgan("dev")); // Логирование запросов

// Подключаем маршруты
app.use("/api/auth", authRoutes);

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  try {
    await db.authenticate();
    console.log("Подключение к базе данных успешно!");
  } catch (error) {
    console.error("Ошибка подключения к базе данных:", error);
  }
});
