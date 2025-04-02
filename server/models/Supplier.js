const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Delivery = require("./Delivery");

const Supplier = db.define("Supplier", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, unique: true, allowNull: false }, // Наименование поставщика
  type: { type: DataTypes.ENUM("Юридическое лицо", "Физическое лицо"), allowNull: false }, // Вид поставщика
  unp: { type: DataTypes.STRING, unique: true, allowNull: false }, // УНП (уникальный номер плательщика)
  unified_state_register: { type: DataTypes.BOOLEAN, defaultValue: true },
  ministry_taxes_duties: { type: DataTypes.BOOLEAN, defaultValue: true },
  country: { type: DataTypes.STRING, allowNull: false, defaultValue: "Беларусь" }, // Страна регистрации
  replacement_days: { type: DataTypes.INTEGER, defaultValue: 0 }, // Срок замены брака
  assortment_count: { type: DataTypes.INTEGER, defaultValue: 0 }, // Количество позиций
  delivery_change: { type: DataTypes.BOOLEAN, defaultValue: true }, // Изменение сроков доставки
  
  defective_rate_year: { type: DataTypes.FLOAT, defaultValue: 0 }, // Брак за год
  defective_rate_total: { type: DataTypes.FLOAT, defaultValue: 0 }, // Общий уровень брака
  on_time_percentage: { type: DataTypes.FLOAT, defaultValue: 0 }, // Процент своевременных поставок
  avg_delivery_time: { type: DataTypes.FLOAT, defaultValue: 0 }, // Средний срок поставки
  received_quantity: { type: DataTypes.INTEGER, defaultValue: 0 }, // Полученное за год количество
  rejected_rate_year: { type: DataTypes.FLOAT, defaultValue: 0 }, // Процент отклоненного товара за год
  category: { type: DataTypes.STRING, defaultValue: "Неизвестно" }, // Категория надежности
});

Supplier.hasMany(Delivery, { foreignKey: "supplierId", as: "deliveries" });
Delivery.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

module.exports = Supplier;
