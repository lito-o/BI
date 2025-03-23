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
    { field: 'country', headerName: 'Страна', width: 150 },
    { 
      field: 'defective_rate_year', 
      headerName: 'Качество (год)', 
      width: 150,
      valueFormatter: (params) => params.value !== undefined ? `${(params.value * 100).toFixed(2)}%` : '0'
    },
    { 
      field: 'defective_rate_total', 
      headerName: 'Качество (всё время)', 
      width: 150,
      valueFormatter: (params) => params.value !== undefined ? `${(params.value * 100).toFixed(2)}%` : '0'
    },
    { 
      field: 'on_time_percentage', 
      headerName: 'Процент вовремя', 
      width: 150,
      valueFormatter: (params) => params.value !== undefined ? `${(params.value * 100).toFixed(2)}%` : '0'
    },
    { 
      field: 'avg_delivery_time', 
      headerName: 'Среднее время доставки', 
      width: 150,
      valueFormatter: (params) => params.value !== undefined ? `${params.value.toFixed(1)} дней` : '0'
    },
  ];

  return (
    <div style={{ height: 400, width: '100%' }}>
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


