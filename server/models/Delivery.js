const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Delivery = db.define("Delivery", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true, },
  delivery_number: { type: DataTypes.INTEGER, allowNull: false, unique: true, comment: "Номер поставки", },
  article: { type: DataTypes.STRING, allowNull: false, comment: "Артикул товара", },
  name: { type: DataTypes.STRING, allowNull: false, comment: "Наименование товара", },
  characteristics: { type: DataTypes.STRING, allowNull: false, comment: "Характеристика товара", },
  quantity: { type: DataTypes.INTEGER, allowNull: false, comment: "Количество единиц товара", },
  defective_quantity: { type: DataTypes.INTEGER, defaultValue: 0, comment: "Количество единиц товара с браком", },
  quality_of_delivery: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, comment: "Качество поставки", },
  unit: { type: DataTypes.STRING, allowNull: false, comment: "Единицы измерения", },
  price_per_unit: { type: DataTypes.FLOAT, allowNull: false, comment: "Цена поставщика (за единицу)", },
  currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "BYN", comment: "Валюта", },
  total_price: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0, comment: "Общая стоимость", },
  purchase_date: { type: DataTypes.DATE, allowNull: false, comment: "Дата и время оформления покупки", },
  arrival_date: { type: DataTypes.DATE, allowNull: false, comment: "Дата и время поступления", },
  delivery_term: { type: DataTypes.DATE, allowNull: false, comment: "Срок доставки", },
  delivery_time: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0, comment: "Время доставки в днях", },
  status: { type: DataTypes.STRING, allowNull: true, comment: "Статус", },
});

module.exports = Delivery;