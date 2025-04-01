const Supplier = require("../models/Supplier");
const Delivery = require("../models/Delivery");
const { Op } = require("sequelize");

/**
 * Пересчет показателей поставщика
 * @param {number} supplierId - ID поставщика
 */
const calculateSupplierStats = async (supplierId) => {
  const deliveries = await Delivery.findAll({ where: { supplierId } });

//   const now = new Date();
//   const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));

  const now = new Date();
  const oneYearAgo = now.getFullYear();
  console.log(oneYearAgo);


  // Данные за год
  const yearDeliveries = deliveries.filter(d => new Date(d.purchase_date) >= oneYearAgo);
  const yearQuantity = yearDeliveries.reduce((sum, d) => sum + d.quantity, 0);
  const yearDefective = yearDeliveries.reduce((sum, d) => sum + d.defective_quantity, 0);
  
  // Общие данные
  const totalQuantity = deliveries.reduce((sum, d) => sum + d.quantity, 0);
  const totalDefective = deliveries.reduce((sum, d) => sum + d.defective_quantity, 0);
  const totalDeliveries = deliveries.length;
  const totalOnTime = deliveries.filter(d => d.status === "Пришел вовремя").length;
  const avgDeliveryTime = totalDeliveries ? deliveries.reduce((sum, d) => sum + d.delivery_time, 0) / totalDeliveries : 0;

  // Рассчитываем новые значения
  const defectiveRateYear = yearQuantity ? yearDefective / yearQuantity : 0;
  const defectiveRateTotal = totalQuantity ? totalDefective / totalQuantity : 0;
  const onTimePercentage = totalDeliveries ? totalOnTime / totalDeliveries : 0;
  const rejectedRateYear = defectiveRateYear;
  const receivedQuantity = yearQuantity;

  // Определяем среднее качество среди всех поставщиков
  const allSuppliers = await Supplier.findAll();
  const avgQuality = allSuppliers.length
    ? allSuppliers.reduce((sum, s) => sum + (s.defective_rate_total || 0), 0) / allSuppliers.length
    : 0;

  let category = "Неизвестно";
  if (defectiveRateTotal < avgQuality) category = "Надежный";
  else if (defectiveRateTotal === avgQuality) category = "Удовлетворительный";
  else category = "Неудовлетворительный";

  // Обновляем поставщика
  await Supplier.update(
    {
      defective_rate_year: defectiveRateYear,
      defective_rate_total: defectiveRateTotal,
      on_time_percentage: onTimePercentage,
      avg_delivery_time: avgDeliveryTime,
      received_quantity: receivedQuantity,
      rejected_rate_year: rejectedRateYear,
      category: category,
    },
    { where: { id: supplierId } }
  );
};

module.exports = calculateSupplierStats;
