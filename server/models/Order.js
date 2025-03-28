const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Order = db.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  request_date: { type: DataTypes.DATE, allowNull: false }, // Дата и время обращения
  confirm_date: { type: DataTypes.DATE }, // Дата и время подтверждения заявки
  confirm_status: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.confirm_date) return "На рассмотрении";
      const diff = new Date() - new Date(this.request_date);
      const days = diff / (1000 * 60 * 60 * 24);
      return days > 7 ? "Отклонён" : "Подтверждён";
    },
  }, // Статус подтверждения
  application_processing_time: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.confirm_date) return null;
      const diff = new Date(this.confirm_date) - new Date(this.request_date);
      return diff / (1000 * 60 * 60); // Время обработки в часах
    },
  }, // Время обработки заявки
  order_ready_date: { type: DataTypes.DATE }, // Дата и время готовности заказа
  description: { type: DataTypes.TEXT, allowNull: false }, // Описание заказа
  total_amount: { type: DataTypes.FLOAT, allowNull: false }, // Сумма заказа
  cost_price: { type: DataTypes.FLOAT, allowNull: false }, // Себестоимость заказа
  currency: { type: DataTypes.TEXT, allowNull: false, defaultValue: "BYN" }, // Валюта
  marginality: {
    type: DataTypes.VIRTUAL,
    get() {
      const totalAmount = this.getDataValue("total_amount");
      const costPrice = this.getDataValue("cost_price");
      return totalAmount ? costPrice / totalAmount : 0;
    },
  }, // Маржинальность
  profit: {
    type: DataTypes.VIRTUAL,
    get() {
      const totalAmount = this.getDataValue("total_amount");
      const costPrice = this.getDataValue("cost_price");
      return totalAmount - costPrice;
    },
  }, // Прибыль
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
  left_to_pay: {
    type: DataTypes.VIRTUAL,
    get() {
      const totalAmount = this.getDataValue("total_amount");
      const paidAmount = this.getDataValue("paid_amount");
      return totalAmount - paidAmount;
    },
  }, // Осталось оплатить
  payment_date: { type: DataTypes.DATE }, // Дата и время оплаты
  payment_term: { type: DataTypes.DATE }, // Срок оплаты
  order_payment_time: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.order_ready_date || !this.payment_date) return 0;
      const orderPaymentTime =
        new Date(this.order_ready_date) - new Date(this.payment_date);
      return orderPaymentTime / (1000 * 60 * 60 * 24);
    },
  }, // Время оплаты заказа
  payment_term_status: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.payment_date || !this.payment_term) return null;
      return new Date(this.payment_date) <= new Date(this.payment_term)
        ? "Соответствует"
        : "Не Соответствует";
    },
  }, // Соответствие срокам оплаты
  delivery_time: { type: DataTypes.DATE }, // Срок доставки
  delivery_date: { type: DataTypes.DATE }, // Дата и время доставки заказа
  delivery_status: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.delivery_date || !this.delivery_time) return null;
      return new Date(this.delivery_date) <= new Date(this.delivery_time)
        ? "Соответствует"
        : "Не Соответствует";
    },
  }, // Соответствие срокам доставки
  order_completion_time: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.request_date || !this.delivery_date) return null;
      const orderCompletionTime =
        new Date(this.delivery_date) - new Date(this.request_date);
      return orderCompletionTime / (1000 * 60 * 60 * 24); // Время выполнения в днях
    },
  }, // Время выполнения заказа
  status: {
    type: DataTypes.VIRTUAL,
    get() {
      if (!this.confirm_date) return "На рассмотрении";
      return this.confirm_status === "Подтверждён" ? "Подтвержден" : "Не подтвержден";
    },
  }, // Статус заказа
});

module.exports = Order;

