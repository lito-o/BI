const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Client = require("./Client");

const Order = db.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  request_date: { type: DataTypes.DATE, allowNull: false }, // Дата обращения
  confirm_date: { type: DataTypes.DATE }, // Дата подтверждения
  description: { type: DataTypes.TEXT, allowNull: false }, // Описание заказа
  total_amount: { type: DataTypes.FLOAT, allowNull: false }, // Сумма заказа
  cost_price: { type: DataTypes.FLOAT, allowNull: false }, // Себестоимость
  profit: {
    type: DataTypes.FLOAT,
    get() {
      return this.getDataValue("total_amount") - this.getDataValue("cost_price");
    },
  }, // Прибыль
});

// Связь с таблицей "Клиенты"
Order.belongsTo(Client, { foreignKey: "clientId", as: "client" });

module.exports = Order;

