const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Client = require("../models/Client");
const { body, validationResult } = require("express-validator");

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

// Добавить новый заказ
// router.post(
//   "/",
//   [
//     body("clientId").isInt().withMessage("ID клиента должен быть числом"),
//     body("totalAmount").isFloat({ min: 0 }).withMessage("Сумма заказа должна быть положительной"),
//     body("currency").notEmpty().withMessage("Валюта обязательна"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     try {
//       const newOrder = await Order.create(req.body);
//       res.json(newOrder);
//     } catch (error) {
//       res.status(500).json({ error: "Ошибка создания заказа" });
//     }
//   }
// );

module.exports = router;
