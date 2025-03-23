const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Client = db.define("Client", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Наименование клиента
  type: { type: DataTypes.ENUM("Юридическое лицо", "Физическое лицо"), allowNull: false }, // Вид клиента
  unp: { type: DataTypes.STRING, unique: true, allowNull: false }, // УНП (уникальный номер плательщика)
  avg_check: { type: DataTypes.FLOAT, defaultValue: 0 }, // Средний чек клиента
  debt: { type: DataTypes.FLOAT, defaultValue: 0 }, // Дебиторская задолженность
  avg_payment_time: { type: DataTypes.FLOAT, defaultValue: 0 }, // Среднее время оплаты счетов
  activity_status: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.getDataValue("monthly_orders") > this.getDataValue("avg_orders_all")
        ? "Активный"
        : "Пассивный";
    },
  }, // Активность клиента
});

module.exports = Client;

