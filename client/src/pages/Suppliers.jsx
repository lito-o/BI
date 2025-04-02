import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { getSuppliers } from "../services/api";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSuppliers();
      setSuppliers(data);
    };
    fetchData();
  }, []);

  const columns = [
    { field: 'name', headerName: 'Наименование', width: 150 },
    { field: 'type', headerName: 'Вид', width: 150 },
    { field: 'country', headerName: 'Страна', width: 100 },
    { field: 'unified_state_register', headerName: 'ЕГР', type: 'boolean', width: 150 },
    { field: 'ministry_taxes_duties', headerName: 'МНС', type: 'boolean', width: 150 },
    { 
      field: 'defective_rate_year', 
      headerName: 'Качество (год)', 
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
      field: 'defective_rate_total', 
      headerName: 'Качество (всё время)', 
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
      field: 'on_time_percentage', 
      headerName: 'Процент вовремя', 
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
      field: 'replacement_days', 
      headerName: 'Срок замены', 
      width: 100,
      // valueFormatter: (params) => params.value !== undefined ? `${(params.value * 100).toFixed(2)}%` : '0'
    },
    { 
      field: 'assortment_count', 
      headerName: 'Ассортимент', 
      width: 100,
      // valueFormatter: (params) => params.value !== undefined ? `${params.value.toFixed(1)} дней` : '0'
    },
    { field: 'delivery_change', headerName: 'Изменение срока', type: 'boolean', width: 150 },
    { 
      field: 'avg_delivery_time', 
      headerName: 'Среднее время доставки', 
      width: 150,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(0) : "N/A",
    },
    { 
      field: 'received_quantity', 
      headerName: 'Количество поставок', 
      width: 150,
      valueGetter: (value) =>
        value !== undefined ? value.toFixed(0) : "N/A",
    },
    { 
      field: 'rejected_rate_year', 
      headerName: 'Доля отклоненного товара', 
      width: 150,
      valueFormatter: (value) => {
        if (value == null) {
          return '';
        }
        value *= 100;
        return `${value.toFixed(2)} %`;
      },
    },
    { field: 'category', headerName: 'Категория', width: 150 },
  ];

  return (
    <div style={{ height: 900, width: '100%' }}>
      <DataGrid
        rows={suppliers}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection
        disableSelectionOnClick
      />
    </div>
  );
};

export default Suppliers;


