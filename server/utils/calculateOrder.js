async function calculateOrder(order) {
    const now = new Date();
    const requestDate = new Date(order.request_date);
    const confirmDate = order.confirm_date ? new Date(order.confirm_date) : null;
    const orderReadyDate = order.order_ready_date ? new Date(order.order_ready_date) : null;
    const paymentDate = order.payment_date ? new Date(order.payment_date) : null;
    const paymentTerm = order.payment_term ? new Date(order.payment_term) : null;
    const deliveryDate = order.delivery_date ? new Date(order.delivery_date) : null;
    const deliveryTerm = order.delivery_term ? new Date(order.delivery_term) : null;
    const dispatchDate = order.dispatch_date ? new Date(order.dispatch_date) : null;
  
    // Расчет статуса подтверждения
    order.confirm_status = !confirmDate 
      ? "На рассмотрении" 
      : confirmDate - requestDate > 7 * 24 * 60 * 60 * 1000 
        ? "Отклонён" 
        : "Подтверждён";
  
    // Расчет времени обработки заявки
    order.application_processing_time = confirmDate 
      ? (confirmDate - requestDate) / (1000 * 60 * 60 * 24) 
      : null;
  
    // Расчет общих расходов
    order.general_costs = order.transportation_costs + 
      order.labor_costs + 
      order.social_contributions + 
      order.rental_costs + 
      order.maintenance_premises + 
      order.amortization + 
      order.energy_costs + 
      order.taxes + 
      order.staff_labor_costs + 
      order.other_costs;
  
    // Расчет себестоимости
    order.cost_price = order.cost + order.general_costs;
  
    // Расчет маржинальности
    order.marginality = order.total_amount 
      ? (order.total_amount - order.cost_price) / order.total_amount 
      : 0;
  
    // Расчет прибыли
    order.profit = order.total_amount - order.cost_price;
  
    // Расчет рентабельности
    order.return_on_margin = order.profit / order.cost_price;
  
    // Расчет остатка к оплате
    order.left_to_pay = order.total_amount - order.paid_amount;
  
    // Расчет статуса оплаты
    if (order.left_to_pay !== 0) {
      order.payment_term_status = false;
      order.order_payment_time = 0;
    } else {
      order.order_payment_time = orderReadyDate && paymentDate
        ? Math.abs(orderReadyDate - paymentDate) / (1000 * 60 * 60)
        : 0;
      order.payment_term_status = paymentDate && paymentTerm
        ? paymentDate <= paymentTerm
        : null;
    }
  
    // Расчет статуса доставки
    order.delivery_status = deliveryDate && deliveryTerm 
      ? deliveryDate <= deliveryTerm 
      : null;
  
    // Расчет времени выполнения заказа
    order.order_completion_time = deliveryDate 
      ? Math.abs(deliveryDate - requestDate) / (1000 * 60 * 60 * 24) 
      : null;

    // Расчет времени доставки
    if (order.dispatch_date !== null && order.delivery_date === null) {
      order.delivery_time = deliveryDate 
      ? Math.abs(deliveryDate - dispatchDate) / (1000 * 60 * 60 * 24) 
      : null;
    } else {
      order.delivery_time = 0;
    }

    // Расчет общего статуса заказа
    if (!order.confirm_date) {
      order.status = "Новый";
    } else if (order.confirm_status === "Отклонён") {
      order.status = "Отменён";
    } else if (order.confirm_status === "Подтверждён" && order.order_ready_date === null) {
      order.status = "Принят";
    } else if (order.left_to_pay !== 0) {
      order.status = "Оплачивается";
    } else if (order.dispatch_date !== null && order.delivery_date === null) {
      order.status = "Доставляется";
    } 
    else {
      order.status = "Выполнен";
    }
  
    return order;
  }
  
  async function calculateAndSaveOrder(order) {
    await calculateOrder(order);
    await order.save();
    return order;
  }
  
  module.exports = {
    calculateOrder,
    calculateAndSaveOrder
  };