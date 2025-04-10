const express = require("express");
const Client = require("../models/Client");
const Order = require("../models/Order");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const router = express.Router();

// Функция для получения исторических данных по месяцам
const getHistoricalData = async (model, field, whereConditions, groupBy) => {
  const historicalData = await model.findAll({
    attributes: [
      [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "month"],
      [Sequelize.fn("SUM", Sequelize.col(field)), "value"],
    ],
    where: whereConditions,
    group: groupBy,
    order: [["month", "ASC"]],
    raw: true,
  });

  return historicalData.map((item) => ({
    month: moment(item.month).format("YYYY-MM"),
    value: parseFloat(item.value),
  }));
};

// Функция для расчета изменения показателей по отношению к прошлому месяцу
const calculateChange = (currentValue, previousValue) => {
  if (previousValue === 0) return 0;
  return ((currentValue - previousValue) / previousValue) * 100;
};

router.get("/", async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Доля успешно закрытых заказов
    const completedOrders = await Order.count({
      where: {
        confirm_status: "Подтверждён",
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const totalOrders = await Order.count({
      where: {
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });

    const completedOrdersHistory = await Order.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("request_date")), "month"],
        [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
        [Sequelize.fn("SUM", Sequelize.literal("CASE WHEN confirm_status = 'Подтверждён' THEN 1 ELSE 0 END")), "completed"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    }).then(data => 
      data.map(item => ({
        month: moment(item.month).format("YYYY-MM"),
        value: item.total > 0 ? (item.completed / item.total) * 100 : 0
      }))
    );

    const completedOrdersChange = calculateChange(
      completedOrdersHistory[completedOrdersHistory.length - 1]?.value || 0,
      completedOrdersHistory[completedOrdersHistory.length - 2]?.value || 0
    );

    // Средняя стоимость заказа
    const averageOrderCost = await Order.sum("total_amount", {
      where: {
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });

    const averageOrderCostHistory = await Order.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("request_date")), "month"],
        [Sequelize.fn("AVG", Sequelize.col("total_amount")), "value"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    }).then(data => 
      data.map(item => ({
        month: moment(item.month).format("YYYY-MM"),
        value: parseFloat(item.value) || 0
      }))
    );

    const averageOrderCostChange = calculateChange(
      averageOrderCostHistory[averageOrderCostHistory.length - 1]?.value || 0,
      averageOrderCostHistory[averageOrderCostHistory.length - 2]?.value || 0
    );

    // Среднее время выполнения заказа
    const averageOrderTime = await Order.sum("order_completion_time", {
      where: {
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });
    
    const averageOrderTimeHistory = await Order.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("request_date")), "month"],
        [Sequelize.fn("AVG", Sequelize.col("order_completion_time")), "value"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    }).then(data => 
      data.map(item => ({
        month: moment(item.month).format("YYYY-MM"),
        value: parseFloat(item.value) || 0
      }))
    );

    const averageOrderTimeChange = calculateChange(
      averageOrderTimeHistory[averageOrderTimeHistory.length - 1]?.value || 0,
      averageOrderTimeHistory[averageOrderTimeHistory.length - 2]?.value || 0
    );

    // Количество клиентов
    const totalClients = await Client.count({
      where: {
        // createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const totalClientsHistory = await getHistoricalData(
      Client,
      "id",
      {},
      ["month"]
    );
    const totalClientsChange = calculateChange(
      totalClientsHistory[totalClientsHistory.length - 1]?.value || 0,
      totalClientsHistory[totalClientsHistory.length - 2]?.value || 0
    );

    // Количество новых клиентов
    const newClients = await Client.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });

    const newClientsHistory = await getHistoricalData(
      Client,
      "id",
      {},
      ["month"]
    );

    const newClientsChange = calculateChange(
      newClientsHistory[newClientsHistory.length - 1]?.value || 0,
      newClientsHistory[newClientsHistory.length - 2]?.value || 0
    );

    // Общая дебиторская задолженность
    const totalDebt = await Client.sum("debt", {
      where: {
        // createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const totalDebtHistory = await getHistoricalData(
      Client,
      "debt",
      {},
      ["month"]
    );
    const totalDebtChange = calculateChange(
      totalDebtHistory[totalDebtHistory.length - 1]?.value || 0,
      totalDebtHistory[totalDebtHistory.length - 2]?.value || 0
    );

    // Среднее время оплаты заказов
    const averagePaymentTime = await Client.sum("avg_payment_time", {
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo },
      },
    });
    
    const averagePaymentTimeHistory = await Client.findAll({
      attributes: [
        [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "month"],
        [Sequelize.fn("AVG", Sequelize.col("avg_payment_time")), "value"],
      ],
      group: ["month"],
      order: [["month", "ASC"]],
      raw: true,
    }).then(data => 
      data.map(item => ({
        month: moment(item.month).format("YYYY-MM"),
        value: parseFloat(item.value) || 0
      }))
    );

    const averagePaymentTimeChange = calculateChange(
      averagePaymentTimeHistory[averagePaymentTimeHistory.length - 1]?.value || 0,
      averagePaymentTimeHistory[averagePaymentTimeHistory.length - 2]?.value || 0
    );

    // Объем продаж
    const salesVolume = await Order.sum("total_amount", {
      where: {
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const salesVolumeHistory = await getHistoricalData(
      Order,
      "total_amount",
      {},
      ["month"]
    );
    const salesVolumeChange = calculateChange(
      salesVolumeHistory[salesVolumeHistory.length - 1]?.value || 0,
      salesVolumeHistory[salesVolumeHistory.length - 2]?.value || 0
    );

    // Расходы на реализацию
    const implementationCosts = await Order.sum("general_costs", {
      where: {
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const implementationCostsHistory = await getHistoricalData(
      Order,
      "general_costs",
      {},
      ["month"]
    );
    const implementationCostsChange = calculateChange(
      implementationCostsHistory[implementationCostsHistory.length - 1]?.value || 0,
      implementationCostsHistory[implementationCostsHistory.length - 2]?.value || 0
    );

    // Рентабельность реализованной продукции
    const profitSum = await Order.sum("profit", {
      where: {
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const costSum = await Order.sum("cost_price", {
      where: {
        request_date: { [Op.gte]: thirtyDaysAgo },
      },
    });
    const productProfitability = costSum > 0 ? (profitSum / costSum) * 100 : 0;
    const productProfitabilityHistory = await Promise.all([
      getHistoricalData(Order, "profit", {}, ["month"]),
      getHistoricalData(Order, "cost_price", {}, ["month"])
    ]).then(([profitHistory, costHistory]) => 
      profitHistory.map((item, index) => ({
        month: item.month,
        value: costHistory[index]?.value > 0 
          ? (item.value / costHistory[index]?.value) * 100 
          : 0
      }))
    );
    const productProfitabilityChange = calculateChange(
      productProfitabilityHistory[productProfitabilityHistory.length - 1]?.value || 0,
      productProfitabilityHistory[productProfitabilityHistory.length - 2]?.value || 0
    );

    // Рентабельность продаж
    const salesProfitability = salesVolume > 0 ? (profitSum / salesVolume) * 100 : 0;
    const salesProfitabilityHistory = await Promise.all([
      getHistoricalData(Order, "profit", {}, ["month"]),
      getHistoricalData(Order, "total_amount", {}, ["month"])
    ]).then(([profitHistory, salesHistory]) => 
      profitHistory.map((item, index) => ({
        month: item.month,
        value: salesHistory[index]?.value > 0 
          ? (item.value / salesHistory[index]?.value) * 100 
          : 0
      }))
    );
    const salesProfitabilityChange = calculateChange(
      salesProfitabilityHistory[salesProfitabilityHistory.length - 1]?.value || 0,
      salesProfitabilityHistory[salesProfitabilityHistory.length - 2]?.value || 0,
    );

    const data = {
      completedOrders: {
        value: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        change: completedOrdersChange,
        history: completedOrdersHistory,
      },
      averageOrderCost: {
        value: totalOrders > 0 ? averageOrderCost / totalOrders : 0,
        change: averageOrderCostChange,
        history: averageOrderCostHistory,
      },
      averageOrderTime: {
        value: totalOrders > 0 ? averageOrderTime / totalOrders : 0,
        change: averageOrderTimeChange,
        history: averageOrderTimeHistory,
      },
      totalClients: {
        value: totalClients,
        change: totalClientsChange,
        history: totalClientsHistory,
      },
      newClients: {
        value: newClients,
        change: newClientsChange,
        history: newClientsHistory,
      },
      totalDebt: {
        value: totalDebt,
        change: totalDebtChange,
        history: totalDebtHistory,
      },
      averagePaymentTime: {
        value: totalClients > 0 ? averagePaymentTime / totalClients : 0,
        change: averagePaymentTimeChange,
        history: averagePaymentTimeHistory,
      },
      salesVolume: {
        value: salesVolume,
        change: salesVolumeChange,
        history: salesVolumeHistory,
      },
      implementationCosts: {
        value: implementationCosts,
        change: implementationCostsChange,
        history: implementationCostsHistory,
      },
      productProfitability: {
        value: productProfitability,
        change: productProfitabilityChange,
        history: productProfitabilityHistory,
      },
      salesProfitability: {
        value: salesProfitability,
        change: salesProfitabilityChange,
        history: salesProfitabilityHistory,
      },
    };

    res.json(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;