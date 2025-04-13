const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Order = db.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  request_date: { type: DataTypes.DATE, allowNull: false }, // Дата и время обращения
  confirm_date: { type: DataTypes.DATE }, // Дата и время подтверждения заявки
  confirm_status: { type: DataTypes.STRING }, // Статус подтверждения
  application_processing_time: { type: DataTypes.FLOAT }, // Время обработки заявки
  order_ready_date: { type: DataTypes.DATE }, // Дата и время готовности заказа
  description: { type: DataTypes.TEXT, allowNull: false }, // Описание заказа
  total_amount: { type: DataTypes.FLOAT, allowNull: false }, // Сумма заказа
  
  cost: { type: DataTypes.FLOAT, defaultValue: 0 }, // Стоимость
  
  cost_price: { type: DataTypes.FLOAT, defaultValue: 0 }, // Себестоимость заказа
  
  transportation_costs: { type: DataTypes.FLOAT, defaultValue: 0 }, // Транспортные расходы
  labor_costs: { type: DataTypes.FLOAT, defaultValue: 0 }, // Расходы на оплату труда
  social_contributions: { type: DataTypes.FLOAT, defaultValue: 0 }, // Расходы на социальные нужды
  rental_costs: { type: DataTypes.FLOAT, defaultValue: 0 }, // Расходы на аренду
  maintenance_premises: { type: DataTypes.FLOAT, defaultValue: 0 }, // Расходы на содержание помещений
  amortization: { type: DataTypes.FLOAT, defaultValue: 0 }, // Амортизация ОС и НМА
  energy_costs: { type: DataTypes.FLOAT, defaultValue: 0 }, // Расходы на энергоресурсы
  taxes: { type: DataTypes.FLOAT, defaultValue: 0 }, // Налоги
  staff_labor_costs: { type: DataTypes.FLOAT, defaultValue: 0 }, // Расходы на обеспечение труда персонала
  other_costs: { type: DataTypes.FLOAT, defaultValue: 0 }, // Прочие расходы
  general_costs: { type: DataTypes.FLOAT, defaultValue: 0 }, // Все расходы (Расходы на реализацию)

  currency: { type: DataTypes.TEXT, allowNull: false, defaultValue: "BYN" }, // Валюта
  marginality: { type: DataTypes.FLOAT }, // Маржинальность
  profit: { type: DataTypes.FLOAT }, // Прибыль
  return_on_margin: { type: DataTypes.FLOAT }, // Рентабельность продукции
  paid_amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 }, // Оплачено
  left_to_pay: { type: DataTypes.FLOAT }, // Осталось оплатить
  payment_date: { type: DataTypes.DATE }, // Дата и время оплаты
  payment_term: { type: DataTypes.DATE }, // Срок оплаты
  order_payment_time: { type: DataTypes.FLOAT }, // Время оплаты заказа
  payment_term_status: { type: DataTypes.BOOLEAN }, // Соответствие срокам оплаты
  delivery_time: { type: DataTypes.DATE }, // Срок доставки
  delivery_date: { type: DataTypes.DATE }, // Дата и время доставки заказа
  delivery_status: { type: DataTypes.BOOLEAN }, // Соответствие срокам доставки
  order_completion_time: { type: DataTypes.FLOAT }, // Время выполнения заказа
  status: { type: DataTypes.STRING }, // Статус заказа
});

module.exports = Order;