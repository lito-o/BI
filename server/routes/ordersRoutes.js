const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Client = require("../models/Client");
const { body, validationResult } = require("express-validator");
// Импортируем роутер и функции из clientsRoutes
const clientsRouter = require("./clientsRoutes");
const {
  calculateAvgCheck,
  calculateDebt,
  calculateAvgPaymentTime,
  calculateActivityStatus,
  updateClientFields
} = require("./clientsRoutes");

// Функция для вычисления полей и обновления записи в базе данных
async function calculateAndSaveFields(order) {
  const now = new Date();
  const requestDate = new Date(order.request_date);
  const confirmDate = order.confirm_date ? new Date(order.confirm_date) : null;
  const orderReadyDate = order.order_ready_date ? new Date(order.order_ready_date) : null;
  const paymentDate = order.payment_date ? new Date(order.payment_date) : null;
  const paymentTerm = order.payment_term ? new Date(order.payment_term) : null;
  const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;
  const deliveryTime = order.delivery_time ? new Date(order.delivery_time) : null;

  order.confirm_status = !confirmDate ? "На рассмотрении" : confirmDate - requestDate > 7 * 24 * 60 * 60 * 1000 ? "Отклонён" : "Подтверждён";
  order.application_processing_time = confirmDate ? (confirmDate - requestDate) / (1000 * 60 * 60) : null;
  order.marginality = order.total_amount ? order.cost_price / order.total_amount : 0;
  order.profit = order.total_amount - order.cost_price;
  order.left_to_pay = order.total_amount - order.paid_amount;
  order.order_payment_time = orderReadyDate && paymentDate 
    ? Math.abs(orderReadyDate - paymentDate) / (1000 * 60 * 60) 
    : 0;
  order.payment_term_status = paymentDate && paymentTerm ? paymentDate <= paymentTerm ? true : false : null;
  order.delivery_status = deliveryDate && deliveryTime ? deliveryDate <= deliveryTime ? true : false : null;
  order.order_completion_time = deliveryDate ? (deliveryDate - requestDate) / (1000 * 60 * 60 * 24) : null;
  order.status = !confirmDate ? "На рассмотрении" : order.confirm_status === "Подтверждён" ? "Подтвержден" : "Не подтвержден";

  await order.save();
}

// Создать новый заказ
router.post(
  "/",
  body("clientId").isInt().withMessage("clientId must be an integer"),
  body("total_amount").isNumeric().withMessage("total_amount must be a number"),
  body("cost_price").isNumeric().withMessage("cost_price must be a number"),
  body("paid_amount").isNumeric().withMessage("paid_amount must be a number"),
  body("request_date").isISO8601().withMessage("request_date must be a valid date"),
  async (req, res) => {
    console.log("Request body:", req.body); // Логирование входных данных
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const client = await Client.findByPk(req.body.clientId);
      if (!client) {
        return res.status(404).json({ error: "Клиент не найден" });
      }

      const order = await Order.create(req.body);
      await calculateAndSaveFields(order);

      // Обновляем поля клиента
      await updateClientFields(order.clientId);

      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error); // Логирование ошибки
      res.status(500).json({ error: "Ошибка создания заказа" });
    }
  }
);

// Получить все заказы
router.get("/", async (req, res) => {
  try {
    const orders = await Order.findAll({ include: Client });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения заказов" });
  }
});

// Получить заказ по ID
router.get("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, { include: Client });
    if (!order) return res.status(404).json({ error: "Заказ не найден" });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения заказа" });
  }
});

// Обновить заказ по ID
router.put("/:id", async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: "Заказ не найден" });
    await order.update(req.body);
    await calculateAndSaveFields(order);

    // Обновляем поля клиента
    await updateClientFields(order.clientId);

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Ошибка обновления заказа" });
  }
});

module.exports = router;
