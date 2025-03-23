const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");

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
// router.post("/", async (req, res) => {
//   try {
//     const { name, type, country } = req.body;
//     const newSupplier = await Supplier.create({ name, type, country });
//     res.json(newSupplier);
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка создания поставщика" });
//   }
// });

module.exports = router;
