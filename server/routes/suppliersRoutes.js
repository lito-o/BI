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
        suppliersData = req.body.suppliers;
      } else {
        suppliersData = [req.body];
      }

      const results = {
        created: [],
        updated: [],
        errors: []
      };

      for (const supplierData of suppliersData) {
        try {
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
            results.errors.push({ supplier: supplierData, error: "Обязательные поля: name, type, country" });
            continue;
          }

          // Проверяем существование поставщика по УНП
          if (unp) {
            const existingSupplier = await Supplier.findOne({ where: { unp } });
            
            if (existingSupplier) {
              // Обновляем существующего поставщика
              await existingSupplier.update(supplierData);
              await calculateSupplierStats(existingSupplier.id);
              results.updated.push(existingSupplier);
              continue;
            }
          }

          // Создаем нового поставщика
          const newSupplier = await Supplier.create(supplierData);
          await calculateSupplierStats(newSupplier.id);
          results.created.push(newSupplier);
        } catch (error) {
          console.error("Error processing supplier:", error);
          results.errors.push({ supplier: supplierData, error: error.message });
        }
      }

      res.status(201).json(results);
    } catch (error) {
      console.error("Error creating suppliers:", error);
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