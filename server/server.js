require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const Client = require("./models/Client");
const Delivery = require("./models/Delivery");
const Order = require("./models/Order");
const Supplier = require("./models/Supplier");

const app = express();

// Настройки
app.use(cors()); // Разрешаем CORS
app.use(express.json()); // Разбираем JSON в запросах
app.use(morgan("dev")); // Логирование запросов

// Импорт маршрутов
const supplierRoutes = require("./routes/suppliersRoutes");
const deliveryRoutes = require("./routes/deliveriesRoutes");
const clientRoutes = require("./routes/clientsRoutes");
const orderRoutes = require("./routes/ordersRoutes");

// Подключаем маршруты
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/orders", orderRoutes);

// Принудительное создание таблиц
db
  .sync({ alter: true })
  .then(() => console.log("✅ База данных синхронизирована"))
  .catch((err) => console.error("❌ Ошибка синхронизации БД:", err));

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