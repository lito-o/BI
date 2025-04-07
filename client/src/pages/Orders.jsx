import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { LinearProgress, Alert } from "@mui/material";
import { getOrders } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getOrders();
        // console.log("API Response:", response);

        if (!response) {
          throw new Error("Пустой ответ от сервера");
        }

        // Проверяем, что response - массив
        if (!Array.isArray(response)) {
          throw new Error("Ожидался массив заказов");
        }

        const formattedOrders = response.map(order => ({
          ...order,
          id: order.id,
          clientName: order.Client?.name || order.client?.name || "Неизвестно"
        }));

        setOrders(formattedOrders);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        setError(error.message);
      } finally {
        setLoading(false);
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
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "status",
      headerName: "Статус заказа",
      width: 120,
    },
    {
      field: "clientName",
      headerName: "Клиент",
      width: 150
    }
  ];

  if (error) {
    return (
      <Alert severity="error">
        Ошибка загрузки данных: {error}
        <br />
        Проверьте консоль для подробностей
      </Alert>
    );
  }

  return (
    <div style={{ height: 700, width: "100%" }}>
      <DataGrid
        rows={orders}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10]}
        getRowId={(row) => row.id}
        components={{
          LoadingOverlay: LinearProgress,
        }}
      />
    </div>
  );
};

export default Orders;