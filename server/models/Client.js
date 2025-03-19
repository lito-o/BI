const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Client = db.define("Client", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  type: { type: DataTypes.ENUM("Юридическое лицо", "Физическое лицо"), allowNull: false },
  unp: { type: DataTypes.STRING, unique: true, allowNull: false },
  createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
});

// Определение статуса клиента (активный или пассивный)
Client.prototype.getStatus = async function () {
  const [{ avgOrders }] = await sequelize.query(
    `SELECT AVG(order_count) AS avgOrders FROM (SELECT COUNT(*) AS order_count FROM orders GROUP BY clientId) AS subquery`
  );
  
  const [{ clientOrders }] = await sequelize.query(
    `SELECT COUNT(*) AS clientOrders FROM orders WHERE clientId = :clientId AND createdAt > NOW() - INTERVAL '1 month'`,
    { replacements: { clientId: this.id }, type: DataTypes.SELECT }
  );

  return clientOrders > avgOrders ? "Активный" : "Пассивный";
};

module.exports = Client;
