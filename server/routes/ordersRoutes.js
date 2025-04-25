const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Client = require("../models/Client");
const { body, validationResult } = require("express-validator");
const { updateClientFields } = require("../utils/calculateClientStats");
const { calculateAndSaveOrder } = require("../utils/calculateOrder");

// Создать новый заказ или массив заказов
router.post(
  "/",
  body("clientId").optional().isInt().withMessage("clientId must be an integer"),
  body("total_amount").optional().isNumeric().withMessage("total_amount must be a number"),
  body("cost_price").optional().isNumeric().withMessage("cost_price must be a number"),
  body("paid_amount").optional().isNumeric().withMessage("paid_amount must be a number"),
  body("request_date").optional().isISO8601().withMessage("request_date must be a valid date"),
  body("orders.*.clientId").optional().isInt().withMessage("clientId must be an integer"),
  body("orders.*.total_amount").optional().isNumeric().withMessage("total_amount must be a number"),
  body("orders.*.cost_price").optional().isNumeric().withMessage("cost_price must be a number"),
  body("orders.*.paid_amount").optional().isNumeric().withMessage("paid_amount must be a number"),
  body("orders.*.request_date").optional().isISO8601().withMessage("request_date must be a valid date"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      let ordersData;
      if (req.body.orders && Array.isArray(req.body.orders)) {
        ordersData = req.body.orders;
      } else {
        ordersData = [req.body];
      }

      const results = {
        created: [],
        updated: [],
        errors: []
      };

      for (const orderData of ordersData) {
        try {
          const client = await Client.findByPk(orderData.clientId);
          if (!client) {
            results.errors.push({ order: orderData, error: "Клиент не найден" });
            continue;
          }

          // Проверяем существование заказа по номеру
          if (orderData.order_number) {
            const existingOrder = await Order.findOne({ where: { order_number: orderData.order_number } });
            
            if (existingOrder) {
              // Обновляем существующий заказ
              await existingOrder.update(orderData);
              await calculateAndSaveOrder(existingOrder);
              await updateClientFields(existingOrder.clientId);
              results.updated.push(existingOrder);
              continue;
            }
          }

          // Создаем новый заказ
          const order = await Order.create(orderData);
          await calculateAndSaveOrder(order);
          await updateClientFields(order.clientId);
          results.created.push(order);
        } catch (error) {
          console.error("Error processing order:", error);
          results.errors.push({ order: orderData, error: error.message });
        }
      }

      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating orders:", error);
      res.status(500).json({ error: "Ошибка создания заказов" });
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
    await calculateAndSaveOrder(order);
    await updateClientFields(order.clientId);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Ошибка обновления заказа" });
  }
});

module.exports = router;