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

// Создать новую поставку
router.post("/", async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const delivery = await Delivery.create(req.body);
    await calculateAndSaveDelivery(delivery);

    // Пересчет данных поставщика
    await calculateSupplierStats(delivery.supplierId);

    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания поставки" });
  }
});

module.exports = router;
