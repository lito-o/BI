const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const Client = require("../models/Client");
const Order = require("../models/Order");
const { body, validationResult } = require("express-validator");
const updateClientFields = require("../utils/calculateClientStats");

// Получить всех клиентов
router.get("/", async (req, res) => {
  try {
    const clients = await Client.findAll();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

// Добавить нового клиента
router.post("/", 
  [
    body('name').notEmpty().withMessage('Имя обязательно'),
    body('type').notEmpty().withMessage('Тип обязателен'),
    body('country').notEmpty().withMessage('Страна обязательна')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, type, country, unp, unified_state_register, ministry_taxes_duties } = req.body;
      
      if (!name || !type || !country) {
        return res.status(400).json({ error: "Обязательные поля: name, type, country" });
      }

      const newClient = await Client.create({ 
        name, 
        type, 
        country, 
        unp, 
        unified_state_register, 
        ministry_taxes_duties 
      });

      try {
        await updateClientFields(newClient.id);
      } catch (updateError) {
        console.error('Ошибка при обновлении полей клиента:', updateError);
      }

      res.json(newClient);
    } catch (error) {
      console.error('Ошибка при создании клиента:', error);
      res.status(500).json({ 
        error: "Ошибка создания клиента",
        details: error.message 
      });
    }
  }
);

// Получить клиента по ID
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findByPk(req.params.id);
    if (!client) return res.status(404).json({ error: "Клиент не найден" });

    // Обновляем вычисляемые поля перед отправкой
    await updateClientFields(client.id);

    // Получаем обновленного клиента из базы данных
    const updatedClient = await Client.findByPk(client.id);
    res.json(updatedClient);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения клиента" });
  }
});

module.exports = router;