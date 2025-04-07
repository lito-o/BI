import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { LinearProgress, Alert } from "@mui/material";
import { getDeliveries } from "../services/api";

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getDeliveries();
        console.log("API Deliveries Response:", response);

        if (!response) {
          throw new Error("Пустой ответ от сервера");
        }

        if (!Array.isArray(response)) {
          throw new Error("Ожидался массив поставок");
        }

        // Форматируем данные для DataGrid
        const formattedDeliveries = response.map(delivery => ({
          ...delivery,
          id: delivery.id,
          supplierName: delivery.Supplier?.name || delivery.supplier?.name || "Неизвестно",
          quality_of_delivery: delivery.defective_quantity 
            ? 1 - (delivery.defective_quantity / delivery.quantity)
            : null
        }));

        setDeliveries(formattedDeliveries);
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
    { field: "article", headerName: "Артикул", width: 100 },
    { field: "name", headerName: "Наименование", width: 150 },
    { field: "characteristics", headerName: "Характеристика", width: 150 },
    {
      field: "quantity",
      headerName: "Количество",
      width: 120,
    },
    {
      field: "defective_quantity",
      headerName: "Количество брака",
      width: 130,
    },
    {
      field: "quality_of_delivery",
      headerName: "Качество поставки",
      type: "precent",
      width: 100,
      valueFormatter: (value) => {
        if (value == null) {
          return '';
        }
        value *= 100;
        return `${value.toFixed(2)} %`;
      },
    },
    {
      field: "unit",
      headerName: "Единицы измерения",
      width: 120,
    },
    {
      field: "price_per_unit",
      headerName: "Цена за единицу",
      width: 130,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "currency",
      headerName: "Валюта",
      width: 80,
    },
    {
      field: "total_price",
      headerName: "Общая стоимость",
      width: 130,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(2) : "N/A",
    },
    {
      field: "purchase_date",
      headerName: "Дата покупки",
      width: 130,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "arrival_date",
      headerName: "Дата поступления",
      width: 130,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "delivery_term",
      headerName: "Срок доставки",
      width: 120,
      valueGetter: (value) =>
      value !== undefined ? new Date(value).toLocaleDateString() : "N/A",
    },
    {
      field: "delivery_time",
      headerName: "Время доставки (дн)",
      width: 120,
    },
    { field: "status", headerName: "Статус", width: 150 },
    {
      field: "supplierName",
      headerName: "Поставщик",
      width: 150,
    },
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
        rows={deliveries}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10]}
        checkboxSelection
        disableSelectionOnClick
        components={{ LoadingOverlay: LinearProgress }}
        initialState={{
          sorting: {
            sortModel: [{ field: "purchase_date", sort: "desc" }],
          },
        }}
        getRowId={(row) => row.id}
      />
    </div>
  );
};

export default Deliveries;