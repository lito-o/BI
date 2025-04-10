const express = require("express");
const router = express.Router();
const Delivery = require("../models/Delivery");
const Supplier = require("../models/Supplier");
const { body, validationResult } = require("express-validator");
const calculateSupplierStats = require("../utils/calculateSupplierStats");

// Вычисление полей на сервере и обновление записи в базе данных
async function calculateAndSaveDelivery(delivery) {
  const quantity = delivery.quantity;
  const defectiveQuantity = delivery.defective_quantity;
  const pricePerUnit = delivery.price_per_unit;
  const purchaseDate = new Date(delivery.purchase_date);
  const arrivalDate = new Date(delivery.arrival_date);
  const deliveryTerm = new Date(delivery.delivery_term);

  delivery.quality_of_delivery = 1 - defectiveQuantity / quantity;
  delivery.total_price = quantity * pricePerUnit;
  delivery.delivery_time = Math.ceil((arrivalDate - purchaseDate) / (1000 * 60 * 60 * 24));
  if (arrivalDate > deliveryTerm) {
    const diffTime = arrivalDate - deliveryTerm;
    delivery.status = `Просрочен на ${Math.ceil(diffTime / (1000 * 60 * 60 * 24))} дней`;
  } else {
    delivery.status = "Пришел вовремя";
  }
  await delivery.save();
}

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
        // Обработка массива поставок
        deliveriesData = req.body.deliveries;
      } else {
        // Обработка одной поставки
        deliveriesData = [req.body];
      }

      const createdDeliveries = [];
      for (const deliveryData of deliveriesData) {
        const supplier = await Supplier.findByPk(deliveryData.supplierId);
        if (!supplier) {
          return res.status(404).json({ error: "Поставщик не найден" });
        }

        const delivery = await Delivery.create(deliveryData);
        await calculateAndSaveDelivery(delivery);
        // Пересчет данных поставщика
        await calculateSupplierStats(delivery.supplierId);
        createdDeliveries.push(delivery);
      }

      res.status(201).json(createdDeliveries);
    } catch (error) {
      console.error("Error creating deliveries:", error); // Логирование ошибки
      res.status(500).json({ error: "Ошибка создания поставок" });
    }
  }
);

module.exports = router;