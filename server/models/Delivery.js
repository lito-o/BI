const { DataTypes } = require("sequelize");
const db = require("../config/db");
const Supplier = require("./Supplier");

const Delivery = db.define("Delivery", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  article: { type: DataTypes.STRING, allowNull: false },
  productName: { type: DataTypes.STRING, allowNull: false },
  characteristics: { type: DataTypes.STRING },
  unit: { type: DataTypes.STRING, allowNull: false },
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  currency: { type: DataTypes.STRING, allowNull: false },
  totalCost: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.price * this.quantity;
    },
  },
  purchaseDate: { type: DataTypes.DATE, allowNull: false },
  arrivalDate: { type: DataTypes.DATE },
  deliveryDeadline: { type: DataTypes.DATE, allowNull: false },
  status: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.arrivalDate) return "Ожидается";
      const daysLate =
        new Date(this.arrivalDate) - new Date(this.deliveryDeadline);
      return daysLate > 0 ? `Просрочен на ${daysLate / 86400000} дн.` : "Пришел вовремя";
    },
  },
});

// Связываем поставки с поставщиками
Delivery.belongsTo(Supplier, { foreignKey: "supplierId" });
Supplier.hasMany(Delivery, { foreignKey: "supplierId" });

module.exports = Delivery;
