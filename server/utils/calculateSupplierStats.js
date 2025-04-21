const Supplier = require("../models/Supplier");
const Delivery = require("../models/Delivery");
const { Op } = require("sequelize");

const calculateSupplierStats = async (supplierId) => {
  // Получаем данные поставщика
  const supplier = await Supplier.findByPk(supplierId);
  if (!supplier) throw new Error("Поставщик не найден");

  const deliveries = await Delivery.findAll({ where: { supplierId } });
  
  // Расчет временного периода
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());


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
  const qualityYear = yearQuantity ? (yearQuantity - yearDefective) / yearQuantity : 0;
  const qualityTotal = totalQuantity ? (totalQuantity - totalDefective) / totalQuantity : 0;
  const onTimePercentage = totalDeliveries ? totalOnTime / totalDeliveries : 0;
  const receivedQuantity = yearQuantity;
  
  // Определяем среднее качество среди всех поставщиков
  const allSuppliers = await Supplier.findAll();
  const avgQuality = allSuppliers.length
    ? allSuppliers.reduce((sum, s) => sum + (s.defective_rate_total || 0), 0) / allSuppliers.length
    : 0;

  let category = "Неизвестно";
  if (
    defectiveRateTotal < avgQuality && 
    supplier.unified_state_register === true && 
    supplier.ministry_taxes_duties === true && 
    supplier.replacement_days <= 7 && 
    supplier.assortment_count >= 20 && 
    supplier.delivery_change === true && 
    qualityYear >= qualityTotal &&
    onTimePercentage >= 0.9
  ) category = "Надежный";
  else if (
    supplier.unified_state_register === true && 
    supplier.ministry_taxes_duties === true && 
    supplier.replacement_days <= 10 && 
    supplier.assortment_count >= 10 && 
    supplier.delivery_change === true && 
    qualityYear >= qualityTotal &&
    onTimePercentage >= 0.8
  ) category = "Удовлетворительный";
  else category = "Неудовлетворительный";

  // Обновляем поставщика
  await Supplier.update(
    {
      defective_rate_year: defectiveRateYear,
      defective_rate_total: defectiveRateTotal,
      on_time_percentage: onTimePercentage,
      avg_delivery_time: avgDeliveryTime,
      received_quantity: receivedQuantity,
      quality_year: qualityYear,
      quality_total: qualityTotal,
      category: category,
    },
    { where: { id: supplierId } }
  );
};

module.exports = calculateSupplierStats;
