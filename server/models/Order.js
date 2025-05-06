const { DataTypes } = require("sequelize");
const db = require("../config/db");

const Order = db.define("Order", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  order_number: { type: DataTypes.INTEGER, unique: true, allowNull: false },
  request_date: { type: DataTypes.DATE, allowNull: false },
  confirm_date: { type: DataTypes.DATE },
  confirm_status: { type: DataTypes.STRING },
  application_processing_time: { type: DataTypes.FLOAT },
  order_ready_date: { type: DataTypes.DATE },
  description: { type: DataTypes.TEXT, allowNull: false },
  total_amount: { type: DataTypes.FLOAT, defaultValue: 0 },
  cost: { type: DataTypes.FLOAT, defaultValue: 0 },
  cost_price: { type: DataTypes.FLOAT, defaultValue: 0 },
  transportation_costs: { type: DataTypes.FLOAT, defaultValue: 0 },
  labor_costs: { type: DataTypes.FLOAT, defaultValue: 0 },
  social_contributions: { type: DataTypes.FLOAT, defaultValue: 0 },
  rental_costs: { type: DataTypes.FLOAT, defaultValue: 0 },
  maintenance_premises: { type: DataTypes.FLOAT, defaultValue: 0 },
  amortization: { type: DataTypes.FLOAT, defaultValue: 0 },
  energy_costs: { type: DataTypes.FLOAT, defaultValue: 0 },
  taxes: { type: DataTypes.FLOAT, defaultValue: 0 },
  staff_labor_costs: { type: DataTypes.FLOAT, defaultValue: 0 },
  other_costs: { type: DataTypes.FLOAT, defaultValue: 0 },
  general_costs: { type: DataTypes.FLOAT, defaultValue: 0 },
  currency: { type: DataTypes.TEXT, allowNull: false, defaultValue: "BYN" },
  marginality: { type: DataTypes.FLOAT },
  profit: { type: DataTypes.FLOAT },
  return_on_margin: { type: DataTypes.FLOAT },
  paid_amount: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
  left_to_pay: { type: DataTypes.FLOAT, defaultValue: 0 },
  payment_date: { type: DataTypes.DATE },
  payment_term: { type: DataTypes.DATE },
  order_payment_time: { type: DataTypes.FLOAT },
  payment_term_status: { type: DataTypes.BOOLEAN },
  
  dispatch_date: { type: DataTypes.DATE }, // Дата отправки
  
  delivery_date: { type: DataTypes.DATE }, // Дата доставки
  delivery_term: { type: DataTypes.DATE }, // Срок доставки
  
  delivery_time: { type: DataTypes.FLOAT }, // Время доставки
  
  delivery_status: { type: DataTypes.BOOLEAN },
  order_completion_time: { type: DataTypes.FLOAT },
  status: { type: DataTypes.STRING },
});

module.exports = Order;