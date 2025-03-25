import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { LinearProgress } from "@mui/material";
import { getDeliveries } from "../services/api";

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getDeliveries();
        setDeliveries(data);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
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
      // valueFormatter: (params) => params?.value ?? "N/A",
    },
    {
      field: "defective_quantity",
      headerName: "Количество брака",
      width: 130,
      // valueFormatter: (params) => params?.value ?? "N/A",
    },
    {
      field: "unit",
      headerName: "Единицы измерения",
      width: 120,
      // valueFormatter: (params) => params?.value ?? "N/A",
    },
    {
      field: "price_per_unit",
      headerName: "Цена за единицу",
      width: 130,
      // valueFormatter: (params) => (params?.value ? params.value.toFixed(2) : "N/A"),
    },
    {
      field: "currency",
      headerName: "Валюта",
      width: 80,
      // valueFormatter: (params) => params?.value ?? "N/A",
    },
    {
      field: "total_price",
      headerName: "Общая стоимость",
      width: 130,
      // valueFormatter: (params) => (params?.value ? params.value.toFixed(2) : "N/A"),
    },
    {
      field: "purchase_date",
      headerName: "Дата покупки",
      width: 130,
      // valueFormatter: (params) => (params?.value ? new Date(params.value).toLocaleDateString() : "—"),
    },
    {
      field: "arrival_date",
      headerName: "Дата поступления",
      width: 130,
      // valueFormatter: (params) => (params?.value ? new Date(params.value).toLocaleDateString() : "—"),
    },
    {
      field: "delivery_term",
      headerName: "Срок доставки",
      width: 120,
      // valueFormatter: (params) => (params?.value !== undefined ? `${params.value} дней` : "N/A"),
    },
    {
      field: "delivery_time",
      headerName: "Время доставки",
      width: 120,
      // valueFormatter: (params) => (params?.value !== undefined ? `${params.value} дней` : "N/A"),
    },
    { field: "status", headerName: "Статус", width: 150 },
    {
      field: "supplier",
      headerName: "Поставщик",
      width: 150,
      valueGetter: (params) => {
        return params.row?.supplier?.name || "Неизвестно";
      },
    },
  ];

  return (
    <div style={{ height: 600, width: "100%" }}>
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
      />
    </div>
  );
};

export default Deliveries;