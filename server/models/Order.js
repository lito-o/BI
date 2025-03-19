const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Client = require("./Client");

const Order = db.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false },
  paid: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  status: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.paid >= this.totalAmount ? "Оплачен" : "Не оплачен";
    },
  },
});

// Связываем заказ с клиентом
Order.belongsTo(Client, { foreignKey: "clientId" });
Client.hasMany(Order, { foreignKey: "clientId" });

module.exports = Order;
