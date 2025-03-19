const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Supplier = db.define("Supplier", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("Юридическое лицо", "Физическое лицо"), allowNull: false },
  country: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Supplier;
