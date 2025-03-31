const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const Delivery = require("../models/Delivery");
const calculateSupplierStats = require("../utils/calculateSupplierStats");

// Получить всех поставщиков
router.get("/", async (req, res) => {
  try {
    const suppliers = await Supplier.findAll();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения поставщиков" });
  }
});

// Добавить нового поставщика
router.post("/", async (req, res) => {
  try {
    const { name, type, country } = req.body;
    const newSupplier = await Supplier.create({ name, type, country });

    // Пересчитываем показатели сразу после создания
    await calculateSupplierStats(newSupplier.id);

    res.json(newSupplier);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания поставщика" });
  }
});

// Обновить показатели при изменении поставок
router.post("/update-stats/:supplierId", async (req, res) => {
  try {
    const { supplierId } = req.params;
    await calculateSupplierStats(supplierId);
    res.json({ message: "Данные поставщика обновлены" });
  } catch (error) {
    res.status(500).json({ error: "Ошибка обновления показателей поставщика" });
  }
});

module.exports = router;
