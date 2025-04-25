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

// Добавить нового клиента или массив клиентов
router.post("/",
  [
    body('name').optional().notEmpty().withMessage('Имя обязательно'),
    body('type').optional().notEmpty().withMessage('Тип обязателен'),
    body('country').optional().notEmpty().withMessage('Страна обязательна'),
    body('clients.*.name').optional().notEmpty().withMessage('Имя обязательно'),
    body('clients.*.type').optional().notEmpty().withMessage('Тип обязателен'),
    body('clients.*.country').optional().notEmpty().withMessage('Страна обязательна')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      let clientsData;
      if (req.body.clients && Array.isArray(req.body.clients)) {
        clientsData = req.body.clients;
      } else {
        clientsData = [req.body];
      }

      const results = {
        created: [],
        updated: [],
        errors: []
      };

      for (const clientData of clientsData) {
        try {
          const { name, type, country, unp } = clientData;

          if (!name || !type || !country) {
            results.errors.push({ client: clientData, error: "Обязательные поля: name, type, country" });
            continue;
          }

          // Проверяем существование клиента по УНП
          if (unp) {
            const existingClient = await Client.findOne({ where: { unp } });
            
            if (existingClient) {
              // Обновляем существующего клиента
              await existingClient.update(clientData);
              try {
                await updateClientFields(existingClient.id);
              } catch (updateError) {
                console.error('Ошибка при обновлении полей клиента:', updateError);
              }
              results.updated.push(existingClient);
              continue;
            }
          }

          // Создаем нового клиента
          const newClient = await Client.create(clientData);
          try {
            await updateClientFields(newClient.id);
          } catch (updateError) {
            console.error('Ошибка при обновлении полей клиента:', updateError);
          }
          results.created.push(newClient);
        } catch (error) {
          console.error('Error processing client:', error);
          results.errors.push({ client: clientData, error: error.message });
        }
      }

      res.status(201).json(results);
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

// endpoint для получения заказов клиента
router.get("/:clientId/orders", async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: {
        clientId: req.params.clientId
      },
      order: [['request_date', 'DESC']] // Сортируем по дате обращения
    });
    res.json(orders);
  } catch (error) {
    console.error('Ошибка при получении заказов:', error);
    res.status(500).json({ error: "Ошибка сервера при получении заказов" });
  }
});

module.exports = router;