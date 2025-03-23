const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Supplier = db.define("Supplier", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Наименование поставщика
  type: { type: DataTypes.ENUM("Юридическое лицо", "Физическое лицо"), allowNull: false }, // Вид поставщика
  country: { type: DataTypes.STRING, allowNull: false, defaultValue: "Беларусь"}, // Страна регистрации
  defective_rate_year: { type: DataTypes.FLOAT, defaultValue: 0 }, // Качество продукции за год
  defective_rate_total: { type: DataTypes.FLOAT, defaultValue: 0 }, // Качество продукции за всё время
  on_time_percentage: { type: DataTypes.FLOAT, defaultValue: 0 }, // Процент вовремя доставленных поставок
  replacement_days: { type: DataTypes.INTEGER, defaultValue: 0 }, // Срок замены брака (в днях)
  assortment_count: { type: DataTypes.INTEGER, defaultValue: 0 }, // Количество товаров в ассортименте
  delivery_change: { type: DataTypes.BOOLEAN, defaultValue: true }, // Изменение сроков доставки (разрешено или нет)
  avg_delivery_time: { type: DataTypes.FLOAT, defaultValue: 0 }, // Среднее время доставки
  total_deliveries: { type: DataTypes.INTEGER, defaultValue: 0 }, // Общее количество поставок
  rejected_rate_year: { type: DataTypes.FLOAT, defaultValue: 0 }, // Доля отклоненного товара за год
  category: {
    type: DataTypes.ENUM("Надежный", "Удовлетворительный", "Неудовлетворительный"),
    allowNull: false,
    defaultValue: "Удовлетворительный",
  }, // Категория поставщика
});

module.exports = Supplier; 

