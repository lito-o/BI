const express = require("express");
const router = express.Router();
const Client = require("../models/Client");
const { body, validationResult } = require("express-validator");

router.get("/", async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Получить клиента по ID
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: "Клиент не найден" });

    client.dataValues.status = await client.getStatus();
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения клиента" });
  }
});

module.exports = router;

// Добавить нового клиента
// router.post(
//   "/",
//   [
//     body("name").notEmpty().withMessage("Наименование клиента обязательно"),
//     body("type").isIn(["Юридическое лицо", "Физическое лицо"]).withMessage("Некорректный тип клиента"),
//     body("unp").notEmpty().withMessage("УНП обязательно"),
//   ],
//   async (req, res) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

//     try {
//       const newClient = await Client.create(req.body);
//       res.json(newClient);
//     } catch (error) {
//       res.status(500).json({ error: "Ошибка создания клиента" });
//     }
//   }
// );