const { DataTypes, Sequelize } = require("sequelize");
const db = require("../config/db");
const Order = require("./Order");

const Client = db.define("Client", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false }, // Наименование клиента
  type: { type: DataTypes.ENUM("Юридическое лицо", "Физическое лицо"), allowNull: false }, // Вид клиента
  unp: { type: DataTypes.STRING, unique: true, allowNull: false }, // УНП (уникальный номер плательщика)
  avg_check: { type: DataTypes.FLOAT, defaultValue: 0 }, // Средний чек
  debt: { type: DataTypes.FLOAT, defaultValue: 0 }, // Дебиторская задолженность
  avg_payment_time: { type: DataTypes.FLOAT, defaultValue: 0 }, // Среднее время оплаты счетов
  activity_status: { type: DataTypes.STRING, defaultValue: "Пассивный" }, // Активность клиента
});

Client.hasMany(Order, { foreignKey: "clientId" });
Order.belongsTo(Client, { foreignKey: "clientId" });

module.exports = Client;
