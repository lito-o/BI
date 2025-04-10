const Client = require("../models/Client");
const Order = require("../models/Order");
const { Op, Sequelize } = require("sequelize");

async function calculateAvgCheck(clientId) {
    const orders = await Order.findAll({ where: { clientId } });
    if (!orders.length) return 0;
    const totalAmount = orders.reduce((sum, order) => sum + order.total_amount, 0);
    return totalAmount / orders.length;
  }
  
  async function calculateDebt(clientId) {
    const orders = await Order.findAll({ where: { clientId} });
    return orders.reduce((sum, order) => sum + order.left_to_pay, 0);
  }
  // async function calculateDebt(clientId) {
  //   const orders = await Order.findAll({ where: { clientId, payment_date: null } });
  //   return orders.reduce((sum, order) => sum + order.left_to_pay, 0);
  // }
  
  async function calculateAvgPaymentTime(clientId) {
    const orders = await Order.findAll({ where: { clientId } });
    const paymentTimes = orders
      .map(order => order.order_payment_time)
      .filter(time => time !== "Не определено");
    if (!paymentTimes.length) return 0;
    return paymentTimes.reduce((sum, time) => sum + time, 0) / paymentTimes.length;
  }
  
  async function calculateActivityStatus(clientId) {
    const clientOrdersCount = await Order.count({
      where: {
        clientId,
        request_date: { [Sequelize.Op.gte]: Sequelize.literal("NOW() - INTERVAL '1 month'") },
      },
    });
    const avgOrdersAllClients = await Order.count() / (await Client.count());
    return clientOrdersCount > avgOrdersAllClients ? "Активный" : "Пассивный";
  }
  
  async function updateClientFields(clientId) {
    const avgCheck = await calculateAvgCheck(clientId);
    const debt = await calculateDebt(clientId);
    const avgPaymentTime = await calculateAvgPaymentTime(clientId);
    const activityStatus = await calculateActivityStatus(clientId);
  
    await Client.update(
      { avg_check: avgCheck, debt, avg_payment_time: avgPaymentTime, activity_status: activityStatus },
      { where: { id: clientId } }
    );
  }

module.exports.updateClientFields = updateClientFields;
module.exports.calculateAvgCheck = calculateAvgCheck;
module.exports.calculateDebt = calculateDebt;
module.exports.calculateAvgPaymentTime = calculateAvgPaymentTime;
module.exports.calculateActivityStatus = calculateActivityStatus;