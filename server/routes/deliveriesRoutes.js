const express = require("express");
const router = express.Router();
const Delivery = require("../models/Delivery");
const Supplier = require("../models/Supplier");
const { body, validationResult } = require("express-validator");
const calculateSupplierStats = require("../utils/calculateSupplierStats");
const {calculateAndSaveDelivery} = require("../utils/calculateDelivery");

// Получить все поставки
router.get("/", async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
      ],
    });
    // Вычисление и обновление полей для каждой поставки
    for (const delivery of deliveries) {
      await calculateAndSaveDelivery(delivery);
    }
    // Получение обновленных данных из базы данных
    const updatedDeliveries = await Delivery.findAll({
      include: [
        {
          model: Supplier,
          as: "supplier",
        },
      ],
    });
    res.json(updatedDeliveries);
  } catch (error) {
    console.error("Ошибка получения поставок:", error);
    res.status(500).json({ error: "Ошибка получения поставок" });
  }
});

// Создать новую поставку или массив поставок
router.post(
  "/",
  body("supplierId").optional().isInt().withMessage("supplierId must be an integer"),
  body("quantity").optional().isNumeric().withMessage("quantity must be a number"),
  body("defective_quantity").optional().isNumeric().withMessage("defective_quantity must be a number"),
  body("price_per_unit").optional().isNumeric().withMessage("price_per_unit must be a number"),
  body("purchase_date").optional().isISO8601().withMessage("purchase_date must be a valid date"),
  body("arrival_date").optional().isISO8601().withMessage("arrival_date must be a valid date"),
  body("delivery_term").optional().isISO8601().withMessage("delivery_term must be a valid date"),
  body("deliveries.*.supplierId").optional().isInt().withMessage("supplierId must be an integer"),
  body("deliveries.*.quantity").optional().isNumeric().withMessage("quantity must be a number"),
  body("deliveries.*.defective_quantity").optional().isNumeric().withMessage("defective_quantity must be a number"),
  body("deliveries.*.price_per_unit").optional().isNumeric().withMessage("price_per_unit must be a number"),
  body("deliveries.*.purchase_date").optional().isISO8601().withMessage("purchase_date must be a valid date"),
  body("deliveries.*.arrival_date").optional().isISO8601().withMessage("arrival_date must be a valid date"),
  body("deliveries.*.delivery_term").optional().isISO8601().withMessage("delivery_term must be a valid date"),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let deliveriesData;
      if (req.body.deliveries && Array.isArray(req.body.deliveries)) {
        deliveriesData = req.body.deliveries;
      } else {
        deliveriesData = [req.body];
      }

      const results = {
        created: [],
        updated: [],
        errors: []
      };

      for (const deliveryData of deliveriesData) {
        try {
          const supplier = await Supplier.findByPk(deliveryData.supplierId);
          if (!supplier) {
            results.errors.push({ delivery: deliveryData, error: "Поставщик не найден" });
            continue;
          }

          // Проверяем существование поставки по номеру
          if (deliveryData.delivery_number) {
            const existingDelivery = await Delivery.findOne({ 
              where: { delivery_number: deliveryData.delivery_number } 
            });
            
            if (existingDelivery) {
              // Обновляем существующую поставку
              await existingDelivery.update(deliveryData);
              await calculateAndSaveDelivery(existingDelivery);
              await calculateSupplierStats(existingDelivery.supplierId);
              results.updated.push(existingDelivery);
              continue;
            }
          }

          // Создаем новую поставку
          const delivery = await Delivery.create(deliveryData);
          await calculateAndSaveDelivery(delivery);
          await calculateSupplierStats(delivery.supplierId);
          results.created.push(delivery);
        } catch (error) {
          console.error("Error processing delivery:", error);
          results.errors.push({ delivery: deliveryData, error: error.message });
        }
      }

      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating deliveries:", error);
      res.status(500).json({ error: "Ошибка создания поставок" });
    }
  }
);

module.exports = router;