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
  cost_price: { type: DataTypes.FLOAT, allowNull: false }, // Себестоимость заказа
  currency: { type: DataTypes.TEXT, allowNull: false, defaultValue: "BYN" }, // Валюта
  marginality: { type: DataTypes.FLOAT }, // Маржинальность
  profit: { type: DataTypes.FLOAT }, // Прибыль
  paid_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      max(value) {
        if (value > this.total_amount) {
          throw new Error("Оплачено не может быть больше суммы заказа");
        }
      },
    },
  }, // Оплачено
  left_to_pay: { type: DataTypes.FLOAT }, // Осталось оплатить
  payment_date: { type: DataTypes.DATE }, // Дата и время оплаты
  payment_term: { type: DataTypes.DATE }, // Срок оплаты
  order_payment_time: { type: DataTypes.FLOAT }, // Время оплаты заказа
  payment_term_status: { type: DataTypes.STRING }, // Соответствие срокам оплаты
  delivery_time: { type: DataTypes.DATE }, // Срок доставки
  delivery_date: { type: DataTypes.DATE }, // Дата и время доставки заказа
  delivery_status: { type: DataTypes.STRING }, // Соответствие срокам доставки
  order_completion_time: { type: DataTypes.FLOAT }, // Время выполнения заказа
  status: { type: DataTypes.STRING }, // Статус заказа
});
module.exports = Order;