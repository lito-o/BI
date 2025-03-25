const express = require("express");
const router = express.Router();
const Delivery = require("../models/Delivery");
const Supplier = require("../models/Supplier");

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
    res.json(deliveries);
  } catch (error) {
    console.error("Ошибка получения поставок:", error);
    res.status(500).json({ error: "Ошибка получения поставок" });
  }
});


module.exports = router;

// Добавить новую поставку
// router.post("/", async (req, res) => {
//   try {
//     const delivery = await Delivery.create(req.body);
//     res.json(delivery);
//   } catch (error) {
//     res.status(500).json({ error: "Ошибка создания поставки" });
//   }
// });
