const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const { body, validationResult } = require("express-validator");
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

// Добавить нового поставщика или массив поставщиков
router.post(
  "/",
  [
    body("name").optional().notEmpty().withMessage("Имя обязательно"),
    body("type").optional().notEmpty().withMessage("Тип обязателен"),
    body("country").optional().notEmpty().withMessage("Страна обязательна"),
    body("suppliers.*.name").optional().notEmpty().withMessage("Имя обязательно"),
    body("suppliers.*.type").optional().notEmpty().withMessage("Тип обязателен"),
    body("suppliers.*.country").optional().notEmpty().withMessage("Страна обязательна")
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let suppliersData;
      if (req.body.suppliers && Array.isArray(req.body.suppliers)) {
        // Обработка массива поставщиков
        suppliersData = req.body.suppliers;
      } else {
        // Обработка одного поставщика
        suppliersData = [req.body];
      }

      const createdSuppliers = [];
      for (const supplierData of suppliersData) {
        const {
          name,
          type,
          country,
          unp,
          unified_state_register,
          ministry_taxes_duties,
          replacement_days,
          assortment_count,
          delivery_change
        } = supplierData;

        if (!name || !type || !country) {
          return res.status(400).json({ error: "Обязательные поля: name, type, country" });
        }

        const newSupplier = await Supplier.create({
          name,
          type,
          country,
          unp,
          unified_state_register,
          ministry_taxes_duties,
          replacement_days,
          assortment_count,
          delivery_change
        });

        // Пересчитываем показатели сразу после создания
        await calculateSupplierStats(newSupplier.id);
        createdSuppliers.push(newSupplier);
      }

      res.status(201).json(createdSuppliers);
    } catch (error) {
      console.error("Error creating suppliers:", error); // Логирование ошибки
      res.status(500).json({ error: "Ошибка создания поставщиков" });
    }
  }
);

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