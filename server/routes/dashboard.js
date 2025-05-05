const express = require("express");
const Client = require("../models/Client");
const Order = require("../models/Order");
const { Op, Sequelize } = require("sequelize");
const moment = require("moment");
const router = express.Router();

const fillMonthlyGaps = (data, startDate, endDate) => {
  const filledData = [];
  const dataMap = new Map(data.map(item => [item.month, item.value]));
  let currentMonth = startDate.clone().startOf('month');
  let lastValue = 0;

  while (currentMonth.isSameOrBefore(endDate, 'month')) {
    const monthKey = currentMonth.format("YYYY-MM");

    if (dataMap.has(monthKey)) {
      lastValue = dataMap.get(monthKey);
      filledData.push({ month: monthKey, value: lastValue });
    } else {
      filledData.push({ month: monthKey, value: lastValue });
    }
    currentMonth.add(1, 'month');
  }

  return filledData;
};

const getAggregatedHistoricalData = async (model, field, dateField, whereConditions, startDate, endDate, aggregateFn = 'SUM') => {
    let aggregateSequelizeFn;
    switch (aggregateFn.toUpperCase()) {
        case 'AVG':
            aggregateSequelizeFn = Sequelize.fn("AVG", Sequelize.col(field));
            break;
        case 'COUNT':
            aggregateSequelizeFn = Sequelize.fn("COUNT", Sequelize.col(field || 'id'));
            break;
        case 'SUM':
        default:
            aggregateSequelizeFn = Sequelize.fn("SUM", Sequelize.col(field));
            break;
    }

    const dateWhereCondition = {
        [dateField]: {
            [Op.gte]: startDate.toDate(),
            [Op.lte]: endDate.toDate(),
        },
    };

    const rawData = await model.findAll({
        attributes: [
            [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col(dateField)), "month"],
            [aggregateSequelizeFn, "value"],
        ],
        where: { ...whereConditions, ...dateWhereCondition },
        group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col(dateField))],
        order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col(dateField)), "ASC"]],
        raw: true,
    });

    const formattedData = rawData.map((item) => ({
        month: moment(item.month).format("YYYY-MM"),
        value: parseFloat(item.value) || 0,
    }));

    return fillMonthlyGaps(formattedData, startDate, endDate);
};

const calculateChangeFromHistory = (history) => {
    if (!history || history.length < 2) {
        return 0;
    }
    const currentValue = history[history.length - 1].value;
    const previousValue = history[history.length - 2].value;

    if (previousValue === 0) {
        return currentValue > 0 ? 100 : 0;
    }
    return ((currentValue - previousValue) / previousValue) * 100;
};

router.get("/", async (req, res) => {
    try {
        const endDate = req.query.endDate ? moment(req.query.endDate) : moment();
        const startDate = req.query.startDate ? moment(req.query.startDate) : moment().subtract(6, 'months');

        if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
          return res.status(400).send("Неверный формат или диапазон дат.");
        }

        const dateRangeFilter = (dateField) => ({
            [dateField]: { [Op.between]: [startDate.toDate(), endDate.toDate()] },
        });

        const completedOrdersStats = await Order.findAll({
            attributes: [
                [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("request_date")), "month"],
                [Sequelize.fn("COUNT", Sequelize.col("id")), "total"],
                [Sequelize.literal("SUM(CASE WHEN confirm_status = 'Подтверждён' THEN 1 ELSE 0 END)"), "completed"],
            ],
            where: dateRangeFilter('request_date'),
            group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("request_date"))],
            order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("request_date")), "ASC"]],
            raw: true,
        });
        const completedOrdersHistoryRaw = completedOrdersStats.map(item => ({
            month: moment(item.month).format("YYYY-MM"),
            value: item.total > 0 ? (parseInt(item.completed, 10) / parseInt(item.total, 10)) * 100 : 0
        }));
        const completedOrdersHistory = fillMonthlyGaps(completedOrdersHistoryRaw, startDate, endDate);
        const currentCompletedOrdersTotal = completedOrdersStats.reduce((sum, item) => sum + parseInt(item.completed, 10), 0);
        const currentTotalOrders = completedOrdersStats.reduce((sum, item) => sum + parseInt(item.total, 10), 0);
        const currentCompletedOrdersValue = currentTotalOrders > 0 ? (currentCompletedOrdersTotal / currentTotalOrders) * 100 : 0;
        const completedOrdersChange = calculateChangeFromHistory(completedOrdersHistory);

        const averageOrderCostHistory = await getAggregatedHistoricalData(Order, 'total_amount', 'request_date', {}, startDate, endDate, 'AVG');
        const currentAverageOrderCostStats = await Order.findOne({
             attributes: [
                [Sequelize.fn('AVG', Sequelize.col('total_amount')), 'avgValue']
             ],
             where: dateRangeFilter('request_date'),
             raw: true
        });
        const currentAverageOrderCostValue = parseFloat(currentAverageOrderCostStats?.avgValue) || 0;
        const averageOrderCostChange = calculateChangeFromHistory(averageOrderCostHistory);

        const averageOrderTimeHistory = await getAggregatedHistoricalData(Order, 'order_completion_time', 'request_date', {}, startDate, endDate, 'AVG');
        const currentAverageOrderTimeStats = await Order.findOne({
             attributes: [
                [Sequelize.fn('AVG', Sequelize.col('order_completion_time')), 'avgValue']
             ],
             where: dateRangeFilter('request_date'),
             raw: true
        });
        const currentAverageOrderTimeValue = parseFloat(currentAverageOrderTimeStats?.avgValue) || 0;
        const averageOrderTimeChange = calculateChangeFromHistory(averageOrderTimeHistory);

        const salesVolumeHistory = await getAggregatedHistoricalData(Order, 'total_amount', 'request_date', {}, startDate, endDate, 'SUM');
        const currentSalesVolumeStats = await Order.findOne({
             attributes: [
                [Sequelize.fn('SUM', Sequelize.col('total_amount')), 'sumValue']
             ],
             where: dateRangeFilter('request_date'),
             raw: true
        });
        const currentSalesVolumeValue = parseFloat(currentSalesVolumeStats?.sumValue) || 0;
        const salesVolumeChange = calculateChangeFromHistory(salesVolumeHistory);

        const implementationCostsHistory = await getAggregatedHistoricalData(Order, 'general_costs', 'request_date', {}, startDate, endDate, 'SUM');
         const currentImplementationCostsStats = await Order.findOne({
             attributes: [
                [Sequelize.fn('SUM', Sequelize.col('general_costs')), 'sumValue']
             ],
             where: dateRangeFilter('request_date'),
             raw: true
        });
        const currentImplementationCostsValue = parseFloat(currentImplementationCostsStats?.sumValue) || 0;
        const implementationCostsChange = calculateChangeFromHistory(implementationCostsHistory);

        const profitHistory = await getAggregatedHistoricalData(Order, "profit", "request_date", {}, startDate, endDate, 'SUM');
        const costPriceHistory = await getAggregatedHistoricalData(Order, "cost_price", "request_date", {}, startDate, endDate, 'SUM');
        const totalAmountHistory = salesVolumeHistory; // Уже посчитали

        const productProfitabilityHistoryRaw = profitHistory.map((item, index) => {
            const cost = costPriceHistory[index]?.value || 0;
            return {
                month: item.month,
                value: cost > 0 ? (item.value / cost) * 100 : 0
            };
        });
        const productProfitabilityHistory = fillMonthlyGaps(productProfitabilityHistoryRaw, startDate, endDate);
        const currentProfitSum = profitHistory[profitHistory.length - 1]?.value || 0; 
        const currentCostSum = costPriceHistory[costPriceHistory.length - 1]?.value || 0; 
        const currentProductProfitabilityValue = currentCostSum > 0 ? (currentProfitSum / currentCostSum) * 100 : 0;
        const productProfitabilityChange = calculateChangeFromHistory(productProfitabilityHistory);

        const salesProfitabilityHistoryRaw = profitHistory.map((item, index) => {
            const sales = totalAmountHistory[index]?.value || 0;
            return {
                month: item.month,
                value: sales > 0 ? (item.value / sales) * 100 : 0
            };
        });
        const salesProfitabilityHistory = fillMonthlyGaps(salesProfitabilityHistoryRaw, startDate, endDate);
        const currentSalesAmount = totalAmountHistory[totalAmountHistory.length - 1]?.value || 0; 
        const currentSalesProfitabilityValue = currentSalesAmount > 0 ? (currentProfitSum / currentSalesAmount) * 100 : 0; 
        const salesProfitabilityChange = calculateChangeFromHistory(salesProfitabilityHistory);

        const newClientsPerMonthRaw = await Client.findAll({
            attributes: [
                [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "month"],
                [Sequelize.fn("COUNT", Sequelize.col("id")), "new_count"],
            ],
            where: {
                 createdAt: { [Op.lte]: endDate.toDate() }
            },
            group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt"))],
            order: [[Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("createdAt")), "ASC"]],
            raw: true,
        });

        const initialClientCount = await Client.count({
            where: {
                createdAt: { [Op.lt]: startDate.toDate() }
            }
        });

        let cumulativeClients = initialClientCount;
        const totalClientsHistoryMap = new Map();
        newClientsPerMonthRaw.forEach(item => {
            cumulativeClients += parseInt(item.new_count, 10);
            const monthKey = moment(item.month).format("YYYY-MM");
            totalClientsHistoryMap.set(monthKey, cumulativeClients);
        });

        const totalClientsHistory = [];
        let lastKnownTotal = initialClientCount;
        let currentMonthIter = startDate.clone().startOf('month');

        while (currentMonthIter.isSameOrBefore(endDate, 'month')) {
            const monthKey = currentMonthIter.format("YYYY-MM");
            if (totalClientsHistoryMap.has(monthKey)) {
                 lastKnownTotal = totalClientsHistoryMap.get(monthKey);
                 totalClientsHistory.push({ month: monthKey, value: lastKnownTotal });
            } else {
                 totalClientsHistory.push({ month: monthKey, value: lastKnownTotal });
            }
             currentMonthIter.add(1, 'month');
        }

        const currentTotalClientsValue = await Client.count();
        const totalClientsChange = calculateChangeFromHistory(totalClientsHistory);

        const newClientsHistory = await getAggregatedHistoricalData(Client, 'id', 'createdAt', {}, startDate, endDate, 'COUNT');
        const currentNewClientsCount = await Client.count({ where: dateRangeFilter('createdAt')});
        const newClientsChange = calculateChangeFromHistory(newClientsHistory);

        const avgDebtHistory = await getAggregatedHistoricalData(Client, 'debt', 'createdAt', {}, startDate, endDate, 'AVG');
        const currentTotalDebtValue = await Client.sum("debt");
        const totalDebtChange = calculateChangeFromHistory(avgDebtHistory);

        const averagePaymentTimeHistory = await getAggregatedHistoricalData(Client, 'avg_payment_time', 'createdAt', {}, startDate, endDate, 'AVG');
        const currentAveragePaymentTimeStats = await Client.findOne({
             attributes: [
                [Sequelize.fn('AVG', Sequelize.col('avg_payment_time')), 'avgValue']
             ],
             raw: true
        });
         const currentAveragePaymentTimeValue = parseFloat(currentAveragePaymentTimeStats?.avgValue) || 0;
        const averagePaymentTimeChange = calculateChangeFromHistory(averagePaymentTimeHistory);

        const data = {
            completedOrders: {
                value: currentCompletedOrdersValue,
                change: completedOrdersChange,
                history: completedOrdersHistory,
            },
            averageOrderCost: {
                value: currentAverageOrderCostValue,
                change: averageOrderCostChange,
                history: averageOrderCostHistory,
            },
            averageOrderTime: {
                value: currentAverageOrderTimeValue,
                change: averageOrderTimeChange,
                history: averageOrderTimeHistory,
            },
             salesVolume: {
                value: currentSalesVolumeValue,
                change: salesVolumeChange,
                history: salesVolumeHistory,
            },
            implementationCosts: {
                value: currentImplementationCostsValue,
                change: implementationCostsChange,
                history: implementationCostsHistory,
            },
             productProfitability: {
                value: currentProductProfitabilityValue,
                change: productProfitabilityChange,
                history: productProfitabilityHistory,
            },
            salesProfitability: {
                value: currentSalesProfitabilityValue,
                change: salesProfitabilityChange,
                history: salesProfitabilityHistory,
            },
            totalClients: {
                value: currentTotalClientsValue,
                change: totalClientsChange,
                history: totalClientsHistory,
            },
            newClients: {
                value: currentNewClientsCount,
                change: newClientsChange,
                history: newClientsHistory,
            },
            totalDebt: {
                value: currentTotalDebtValue || 0,
                change: totalDebtChange,
                history: avgDebtHistory,
            },
            averagePaymentTime: {
                value: currentAveragePaymentTimeValue,
                change: averagePaymentTimeChange,
                history: averagePaymentTimeHistory,
            },
        };

        res.json(data);

    } catch (error) {
        console.error("Ошибка при загрузке данных дашборда:", error);
        res.status(500).send("Внутренняя ошибка сервера");
    }
});

module.exports = router;