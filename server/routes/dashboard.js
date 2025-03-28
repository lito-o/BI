const express = require("express");
const router = express.Router();
const { QueryTypes } = require("sequelize");
const db = require("../config/db");

// Получение статистики для дашборда
router.get("/", async (req, res) => {
  try {
    // Количество клиентов по месяцам
    const clientsByMonth = await db.query(
      `SELECT TO_CHAR("Clients"."createdAt", 'YYYY-MM') AS month, COUNT(*) AS count FROM public."Clients" GROUP BY month ORDER BY month`,
      { type: QueryTypes.SELECT }
    );

    // Новые клиенты по месяцам
    const newClientsByMonth = await db.query(
      `SELECT TO_CHAR("Clients"."createdAt", 'YYYY-MM') AS month, COUNT(*) AS count FROM public."Clients" WHERE "Clients"."createdAt" > NOW() - INTERVAL '1 month' GROUP BY month ORDER BY month`,
      { type: QueryTypes.SELECT }
    );

    // Средняя стоимость заказа
    const avgOrderValue = await db.query(
      `SELECT TO_CHAR("Orders"."createdAt", 'YYYY-MM') AS month, AVG("Orders"."total_amount") AS value FROM public."Orders" GROUP BY month ORDER BY month`,
      { type: QueryTypes.SELECT }
    );

    // Выручка по заказам
    const revenueByMonth = await db.query(
      `SELECT TO_CHAR("Orders"."createdAt", 'YYYY-MM') AS month, SUM("Orders"."total_amount") AS revenue FROM public."Orders" GROUP BY month ORDER BY month`,
      { type: QueryTypes.SELECT }
    );

    res.json({ clientsByMonth, newClientsByMonth, avgOrderValue, revenueByMonth });
  } catch (error) {
    console.error("Ошибка при выполнении запроса:", error); // Логирование ошибки
    res.status(500).json({ error: "Ошибка загрузки данных" });
  }
});

module.exports = router;