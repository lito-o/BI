const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Регистрация
router.post(
  "/register",
  [
    check("lastName", "Фамилия обязательна").notEmpty(),
    check("firstName", "Имя обязательно").notEmpty(),
    check("email", "Введите корректный email").isEmail(),
    check("password", "Минимальная длина пароля 6 символов").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { lastName, firstName, email, password } = req.body;

    try {
      let user = await User.findOne({ where: { email } });
      if (user) return res.status(400).json({ message: "Пользователь уже зарегистрирован" });

      user = await User.create({ lastName, firstName, email, password });

      res.status(201).json({ message: "Пользователь зарегистрирован" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

// Вход
router.post(
  "/login",
  [
    check("email", "Введите корректный email").isEmail(),
    check("password", "Введите пароль").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });
      if (!user) return res.status(400).json({ message: "Пользователь не найден" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: "Неверный пароль" });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

      res.json({ token, user: { id: user.id, lastName: user.lastName, firstName: user.firstName, email: user.email } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Ошибка сервера" });
    }
  }
);

module.exports = router;
