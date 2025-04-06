import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { LinearProgress } from "@mui/material"; // Импортируем индикатор загрузки
import { getOrders } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Состояние для индикатора загрузки

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setLoading(false); // Убираем индикатор загрузки после завершения
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      field: "request_date",
      headerName: "Дата обращения",
      width: 150,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "confirm_date",
      headerName: "Дата подтверждения",
      width: 150,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "confirm_status",
      headerName: "Статус подтверждения",
      width: 150,
    },
    {
      field: "application_processing_time",
      headerName: "Время обработки заявки (ч)",
      width: 150,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(0) : "N/A",
    },
    {
      field: "order_ready_date",
      headerName: "Дата готовности заказа",
      width: 150,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "description",
      headerName: "Описание",
      width: 150,
    },
    {
      field: "total_amount",
      headerName: "Сумма заказа",
      width: 120,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "cost_price",
      headerName: "Себестоимость",
      width: 120,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "currency",
      headerName: "Валюта",
      width: 80,
    },
    {
      field: "marginality",
      headerName: "Маржинальность",
      width: 120,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "profit",
      headerName: "Прибыль",
      width: 120,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "paid_amount",
      headerName: "Оплачено",
      width: 120,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "left_to_pay",
      headerName: "Осталось оплатить",
      width: 120,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "payment_date",
      headerName: "Дата оплаты",
      width: 150,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "payment_term",
      headerName: "Срок оплаты",
      width: 150,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "order_payment_time",
      headerName: "Время оплаты заказа (дн)",
      width: 150,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(0) : "N/A",
    },
    {
      field: "payment_term_status",
      type: 'boolean',
      headerName: "Соответствие срокам оплаты",
      width: 150,
    },
    {
      field: "delivery_time",
      headerName: "Срок доставки",
      width: 150,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "delivery_date",
      headerName: "Дата доставки",
      width: 150,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "delivery_status",
      type: 'boolean',
      headerName: "Соответствие срокам доставки",
      width: 150,
    },
    {
      field: "order_completion_time",
      headerName: "Время выполнения заказа (дн)",
      width: 150,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(0) : "N/A",
    },
    {
      field: "status",
      headerName: "Статус заказа",
      width: 120,
    },
    {
      field: "client",
      headerName: "Клиент",
      width: 150,
      valueGetter: (params) => {
        if (!params || !params.row || !params.row.client) return "Неизвестно";
        return params.row.client.name || "Неизвестно";
      },
    },
  ];

  return (
    <div style={{ height: 900, width: "100%" }}>
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading} // Индикатор загрузки
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        disableSelectionOnClick
        components={{
          LoadingOverlay: LinearProgress, // Используем LinearProgress для индикатора загрузки
        }}
      />
    </div>
  );
};

export default Orders;