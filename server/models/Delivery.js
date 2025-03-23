const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Supplier = require("./Supplier");

const Delivery = db.define("Delivery", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  article: { type: DataTypes.STRING, allowNull: false }, // Артикул товара
  name: { type: DataTypes.STRING, allowNull: false }, // Наименование товара
  characteristics: { type: DataTypes.STRING, allowNull: false }, // Характеристика товара
  quantity: { type: DataTypes.INTEGER, allowNull: false}, // Количество единиц товара
  defective_quantity: { type: DataTypes.INTEGER, defaultValue: 0 }, // Бракованные единицы товара
  unit: { type: DataTypes.STRING, allowNull: false }, // Единицы измерения
  price_per_unit: { type: DataTypes.FLOAT, allowNull: false }, // Цена за единицу
  currency: { type: DataTypes.STRING, allowNull: false }, // Валюта
  total_price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    get() {
      return this.getDataValue("price_per_unit") * this.getDataValue("quantity");
    },
  }, // Общая стоимость
  purchase_date: { type: DataTypes.DATE, allowNull: false }, // Дата оформления покупки
  arrival_date: { type: DataTypes.DATE, allowNull: false }, // Дата поступления
  delivery_time: {
    type: DataTypes.VIRTUAL,
    get() {
      return Math.ceil((new Date(this.arrival_date) - new Date(this.purchase_date)) / (1000 * 60 * 60 * 24));
    },
  }, // Время доставки в днях
  status: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.delivery_time > this.getDataValue("delivery_term")
        ? `Просрочен на ${this.delivery_time - this.getDataValue("delivery_term")} дней`
        : "Пришел вовремя";
    },
  }, // Статус поставки
  delivery_term: { type: DataTypes.INTEGER, allowNull: false }, // Срок доставки
});

// Связь с таблицей "Поставщики"
Delivery.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });

module.exports = Delivery;

