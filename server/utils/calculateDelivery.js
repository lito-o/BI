async function calculateDelivery(delivery) {
    const quantity = delivery.quantity;
    const defectiveQuantity = delivery.defective_quantity;
    const pricePerUnit = delivery.price_per_unit;
    const purchaseDate = new Date(delivery.purchase_date);
    const arrivalDate = new Date(delivery.arrival_date);
    const deliveryTerm = new Date(delivery.delivery_term);
  
    // Расчет качества поставки
    delivery.quality_of_delivery = 1 - defectiveQuantity / quantity;
    
    // Расчет общей стоимости
    delivery.total_price = quantity * pricePerUnit;
    
    // Расчет времени доставки в днях
    delivery.delivery_time = Math.ceil((arrivalDate - purchaseDate) / (1000 * 60 * 60 * 24));
    
    // Определение статуса поставки
    if (arrivalDate > deliveryTerm) {
      const diffTime = arrivalDate - deliveryTerm;
      delivery.status = `Просрочен на ${Math.ceil(diffTime / (1000 * 60 * 60 * 24))} дней`;
    } else {
      delivery.status = "Пришел вовремя";
    }
  
    return delivery;
  }
  
  async function calculateAndSaveDelivery(delivery) {
    await calculateDelivery(delivery);
    await delivery.save();
    return delivery;
  }
  
  module.exports = {
    calculateDelivery,
    calculateAndSaveDelivery
  };