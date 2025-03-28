const { DataTypes, Sequelize } = require("sequelize");
const db = require("../config/db");
const Order = require("./Order");

const Client = db.define("Client", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false }, // Наименование клиента
  type: { type: DataTypes.ENUM("Юридическое лицо", "Физическое лицо"), allowNull: false }, // Вид клиента
  unp: { type: DataTypes.STRING, unique: true, allowNull: false }, // УНП (уникальный номер плательщика)
  avg_check: {
    type: DataTypes.VIRTUAL,
    async get() {
      const orders = await Order.findAll({ where: { clientId: this.id } });
      if (!orders.length) return 0;
      const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
      return totalAmount / orders.length;
    },
  }, // Средний чек
  debt: {
    type: DataTypes.VIRTUAL,
    async get() {
      const orders = await Order.findAll({ where: { clientId: this.id, payment_date: null } });
      return orders.reduce((sum, order) => sum + order.left_to_pay, 0);
    },
  }, // Дебиторская задолженность
  avg_payment_time: {
    type: DataTypes.VIRTUAL,
    async get() {
      const orders = await Order.findAll({ where: { clientId: this.id } });
      const paymentTimes = orders.map(order => order.order_payment_time).filter(time => time !== "Не определено");
      if (!paymentTimes.length) return 0;
      return paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length;
    },
  }, // Среднее время оплаты счетов
 activity_status: {
    type: DataTypes.VIRTUAL,
    async get() {
      const clientOrdersCount = await Order.count({
        where: {
          clientId: this.id,
          request_date: { [Sequelize.Op.gte]: Sequelize.literal("NOW() - INTERVAL '1 month'") },
        },
      });
      const avgOrdersAllClients = await Order.count() / (await Client.count());
      return clientOrdersCount > avgOrdersAllClients ? "Активный" : "Пассивный";
    },
  }, // Активность клиента
});

Client.hasMany(Order, { foreignKey: "clientId" });
Order.belongsTo(Client, { foreignKey: "clientId" });

module.exports = Client; 
