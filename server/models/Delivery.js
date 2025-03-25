const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Supplier = require("./Supplier");

const Delivery = db.define("Delivery", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  article: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Артикул товара",
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Наименование товара",
  },
  characteristics: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Характеристика товара",
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: "Количество единиц товара",
  },
  defective_quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: "Количество единиц товара с браком",
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Единицы измерения",
  },
  price_per_unit: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: "Цена поставщика (за единицу)",
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "BYN",
    comment: "Валюта",
  },
  total_price: {
    type: DataTypes.VIRTUAL,
    get() {
      const quantity = this.getDataValue("quantity");
      const pricePerUnit = this.getDataValue("price_per_unit");
      return quantity * pricePerUnit;
    },
    comment: "Общая стоимость",
  },
  purchase_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "Дата и время оформления покупки",
  },
  arrival_date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "Дата и время поступления",
  },
  delivery_term: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: "Срок доставки",
  },
  delivery_time: {
    type: DataTypes.VIRTUAL,
    get() {
      const purchaseDate = new Date(this.getDataValue("purchase_date"));
      const arrivalDate = new Date(this.getDataValue("arrival_date"));
      const diffTime = arrivalDate - purchaseDate;
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    comment: "Время доставки в днях",
  },
  status: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.arrival_date || !this.delivery_term) return null;
      const arrivalDate = new Date(this.getDataValue("arrival_date"));
      const deliveryTerm = new Date(this.getDataValue("delivery_term"));
      const diffTime = arrivalDate - deliveryTerm;
      return arrivalDate > deliveryTerm
      ? `Просрочен на ${Math.ceil(diffTime / (1000 * 60 * 60 * 24))} дней`
      : "Пришел вовремя";
    },
    comment: "Статус",
  },
});

// Связь с таблицей "Поставщики"
Delivery.belongsTo(Supplier, { foreignKey: "supplierId", as: "supplier" });
Supplier.hasMany(Delivery, { foreignKey: "supplierId", as: "deliveries" });

module.exports = Delivery;

