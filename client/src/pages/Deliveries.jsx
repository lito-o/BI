import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DataGrid,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid";
import { LinearProgress, Alert, Button } from "@mui/material";
import { getDeliveries } from "../services/api";
import * as XLSX from "xlsx";

const CustomToolbar = () => (
  <GridToolbarContainer>
    <GridToolbarQuickFilter
      quickFilterParser={(searchInput) =>
        searchInput
          .split(" ")
          .filter((word) => word.length > 0)
      }
      debounceMs={300}
    />
  </GridToolbarContainer>
);

const Deliveries = () => {
  const apiRef = useGridApiRef();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);

  const [filterModel, setFilterModel] = useState(() => {
    const saved = localStorage.getItem("deliveriesFilterModel");
    return saved ? JSON.parse(saved) : { items: [], logicOperator: "and" };
  });

  const [sortModel, setSortModel] = useState(() => {
    const saved = localStorage.getItem("deliveriesSortModel");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await getDeliveries();

        if (!response) throw new Error("Пустой ответ от сервера");
        if (!Array.isArray(response)) throw new Error("Ожидался массив поставок");

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

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/suppliers");
        setSuppliers(response.data);
      } catch (error) {
        console.error("Ошибка загрузки поставщиков:", error);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    localStorage.setItem("deliveriesFilterModel", JSON.stringify(filterModel));
  }, [filterModel]);

  useEffect(() => {
    localStorage.setItem("deliveriesSortModel", JSON.stringify(sortModel));
  }, [sortModel]);

  const exportToExcel = () => {
    if (!apiRef.current) return;

    const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    const visibleColumns = gridVisibleColumnFieldsSelector(apiRef);

    const exportData = filteredSortedRowIds.map(id => {
      const row = apiRef.current.getRow(id);
      const rowData = {};
      
      visibleColumns.forEach(field => {
        const column = columns.find(col => col.field === field);
        if (!column) return;

        let value = row[field];
        if (column.valueGetter) {
          value = column.valueGetter(value, row);
        }

        rowData[field] = value !== undefined ? value : '';
      });

      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
    XLSX.writeFile(wb, "deliveries.xlsx");
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const requiredFields = [
        "article", "name", "quantity", "price_per_unit", "supplierId"
      ];
  
      const numberFields = [
        "quantity", "defective_quantity", "price_per_unit", "total_price"
      ];
  
      const dateFields = [
        "purchase_date", "arrival_date", "delivery_term"
      ];
  
      const supplierIds = suppliers.map(s => s.id);
  
      const errors = [];
  
      jsonData.forEach((row, idx) => {
        const rowNumber = idx + 2;
  
        requiredFields.forEach(field => {
          if (!row[field] && row[field] !== 0) {
            errors.push(`Строка ${rowNumber}: отсутствует поле "${field}"`);
          }
        });
  
        if (!supplierIds.includes(row.supplierId)) {
          errors.push(`Строка ${rowNumber}: supplierId ${row.supplierId} не найден среди поставщиков`);
        }
  
        numberFields.forEach(field => {
          if (row[field] !== undefined && isNaN(Number(row[field]))) {
            errors.push(`Строка ${rowNumber}: поле "${field}" должно быть числом`);
          }
        });
  
        dateFields.forEach(field => {
          if (row[field] && isNaN(new Date(row[field]).getTime())) {
            errors.push(`Строка ${rowNumber}: поле "${field}" должно быть валидной датой`);
          }
        });
      });
  
      if (errors.length > 0) {
        alert("Найдены ошибки в Excel-файле:\n" + errors.join("\n"));
        return;
      }
  
      const response = await axios.post("http://localhost:5000/api/deliveries", {
        deliveries: jsonData,
      });
  
      alert(`Импортировано поставок: ${response.data.length}`);
      const updatedDeliveries = await getDeliveries();
      const formatted = updatedDeliveries.map(delivery => ({
        ...delivery,
        id: delivery.id,
        supplierName: delivery.Supplier?.name || delivery.supplier?.name || "Неизвестно",
        quality_of_delivery: delivery.defective_quantity 
          ? 1 - (delivery.defective_quantity / delivery.quantity)
          : null
      }));
      setDeliveries(formatted);
    } catch (error) {
      console.error("Ошибка импорта:", error);
      alert("Ошибка при импорте поставок. См. консоль.");
    }
  };

  const dateColumn = (field, headerName) => ({
    field,
    headerName,
    width: 130,
    type: "date",
    valueGetter: (value) => value ? new Date(value) : null,
    valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : "N/A",
  });

  const numberColumn = (field, headerName, digits = 2) => ({
    field,
    headerName,
    width: 130,
    valueGetter: (value) => value !== undefined ? Number(value).toFixed(digits) : "N/A",
    type: "number",
  });

  const columns = [
    { field: "article", headerName: "Артикул", width: 100 },
    { field: "name", headerName: "Наименование", width: 150 },
    { field: "characteristics", headerName: "Характеристика", width: 150 },
    numberColumn("quantity", "Количество", 0),
    numberColumn("defective_quantity", "Количество брака", 0),
    {
      field: "quality_of_delivery",
      headerName: "Качество поставки",
      width: 150,
      valueFormatter: (value) => {
        if (value == null) return '';
        return `${(value * 100).toFixed(2)} %`;
      },
    },
    { field: "unit", headerName: "Единицы измерения", width: 120 },
    numberColumn("price_per_unit", "Цена за единицу"),
    { field: "currency", headerName: "Валюта", width: 80 },
    numberColumn("total_price", "Общая стоимость"),
    dateColumn("purchase_date", "Дата покупки"),
    dateColumn("arrival_date", "Дата поступления"),
    dateColumn("delivery_term", "Срок доставки"),
    numberColumn("delivery_time", "Время доставки (дн)", 0),
    { field: "status", headerName: "Статус", width: 150 },
    { field: "supplierName", headerName: "Поставщик", width: 150 },
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
    <div style={{ height: 750, width: "100%" }}>
      <Button
        onClick={exportToExcel}
        variant="contained"
        sx={{width: "90px", mt: "18px", mb: "10px", backgroundColor: "#252525"}}
      >
        Экспорт
      </Button>
      <Button
        component="label"
        variant="contained"
        sx={{ width: "90px", mt: "18px", mb: "10px", ml: 2, backgroundColor: "#252525" }}
      >
        Импорт
      <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
      </Button>
      <DataGrid
        apiRef={apiRef}
        rows={deliveries}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10]}
        getRowId={(row) => row.id}
        slots={{
          loadingOverlay: LinearProgress,
          toolbar: CustomToolbar,
        }}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        sortingOrder={["asc", "desc"]}
      />
    </div>
  );
};

export default Deliveries;