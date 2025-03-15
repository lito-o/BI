const { DataTypes } = require("sequelize");
const db = require("../config/db");
const bcrypt = require("bcryptjs");

// Определяем модель пользователя
const User = db.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  lastName: { type: DataTypes.STRING, allowNull: false },
  firstName: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

// Хешируем пароль перед сохранением
User.beforeCreate(async (user) => {
  user.password = await bcrypt.hash(user.password, 10);
});

module.exports = User;

