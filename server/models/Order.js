const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Client = require("./Client");

const Order = db.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  request_date: { type: DataTypes.DATE, allowNull: false }, // Дата обращения
  confirm_date: { type: DataTypes.DATE }, // Дата подтверждения
  status: {
    type: DataTypes.ENUM("Подтверждён", "Отклонён"),
    allowNull: false,
    defaultValue: "Подтверждён",
  },
  description: { type: DataTypes.TEXT, allowNull: false }, // Описание заказа
  total_amount: { type: DataTypes.FLOAT, allowNull: false }, // Сумма заказа
  cost_price: { type: DataTypes.FLOAT, allowNull: false }, // Себестоимость
  profit: {
    type: DataTypes.FLOAT,
    get() {
      return this.getDataValue("total_amount") - this.getDataValue("cost_price");
    },
  }, // Прибыль
  paid_amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  delivery_status: {
    type: DataTypes.ENUM("Соответствует", "Не Соответствует"),
    allowNull: false,
    defaultValue: "Соответствует",
  },
});

// Связь с таблицей "Клиенты"
Order.belongsTo(Client, { foreignKey: "clientId" });

Client.hasMany(Order, { foreignKey: "clientId" });

module.exports = Order; 

