import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DataGrid,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid";
import { LinearProgress, Alert, Snackbar } from "@mui/material";
import { getDeliveries } from "../services/api";
import * as XLSX from "xlsx";
import CustomToolbar from "../components/CustomToolbar";
import Buttons from "../components/Buttons";

const Deliveries = () => {
  const apiRef = useGridApiRef();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [filterModel, setFilterModel] = useState(() => {
    const saved = localStorage.getItem("deliveriesFilterModel");
    return saved ? JSON.parse(saved) : { items: [], logicOperator: "and" };
  });

  const [sortModel, setSortModel] = useState(() => {
    const saved = localStorage.getItem("deliveriesSortModel");
    return saved ? JSON.parse(saved) : [];
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
        setSnackbar({
          open: true,
          message: `Ошибка при загрузке данных: ${error.message}`,
          severity: "error",
        });
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
        setSnackbar({
          open: true,
          message: "Ошибка загрузки поставщиков",
          severity: "error",
        });
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
        rowData[column.headerName] = value !== undefined ? value : '';
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deliveries");
    XLSX.writeFile(wb, "Поставки.xlsx");
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const fieldToHeaderMap = {};
      columns.forEach(col => {
        fieldToHeaderMap[col.headerName] = col.field;
      });
  
      const requiredFields = [
        "Номер поставки", "Артикул", "Наименование", "Количество", "Цена за единицу", "Номер"
      ];
      const numberFields = [
        "Количество", "Количество брака", "Цена за единицу"
      ];
      const dateFields = [
        "Дата покупки", "Дата поступления", "Срок доставки"
      ];
      const supplierIds = suppliers.map(s => s.id);
      const errors = [];
  
      jsonData.forEach((row, idx) => {
        const rowNumber = idx + 2;
        requiredFields.forEach(headerName => {
          if (!row[headerName] && row[headerName] !== 0) {
            errors.push(`Строка ${rowNumber}: отсутствует поле "${headerName}"`);
          }
        });
  
        if (!supplierIds.includes(row["Номер"])) {
          errors.push(`Строка ${rowNumber}: Номер ${row["Номер"]} не найден среди поставщиков`);
        }
  
        numberFields.forEach(headerName => {
          if (row[headerName] !== undefined && isNaN(Number(row[headerName]))) {
            errors.push(`Строка ${rowNumber}: поле "${headerName}" должно быть числом`);
          }
        });
  
        dateFields.forEach(headerName => {
          if (row[headerName] && isNaN(new Date(row[headerName]).getTime())) {
            errors.push(`Строка ${rowNumber}: поле "${headerName}" должно быть валидной датой`);
          }
        });
      });
  
      if (errors.length > 0) {
        setSnackbar({
          open: true,
          message: `Найдены ошибки в Excel-файле:\n${errors.join("\n")}`,
          severity: "error",
        });
        return;
      }
  
      const mappedJsonData = jsonData.map(row => {
        const mappedRow = {};
        Object.keys(row).forEach(headerName => {
          const field = fieldToHeaderMap[headerName];
          mappedRow[field] = row[headerName];
        });
        return mappedRow;
      });
  
      const response = await axios.post("http://localhost:5000/api/deliveries", {
        deliveries: mappedJsonData,
      });
  
      let message = `Импорт завершен: `;
      if (response.data.created.length > 0) {
        message += `Создано новых поставок: ${response.data.created.length}. `;
      }
      if (response.data.updated.length > 0) {
        message += `Обновлено существующих поставок: ${response.data.updated.length}. `;
      }
      if (response.data.errors.length > 0) {
        message += `Ошибок при обработке: ${response.data.errors.length}.`;
      }
  
      setSnackbar({
        open: true,
        message: message,
        severity: "success",
      });
  
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
      setSnackbar({
        open: true,
        message: "Ошибка при импорте поставок. См. консоль.",
        severity: "error",
      });
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
    { field: "delivery_number", headerName: "Номер поставки", width: 100 },
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
        if (value == null) return '100 %';
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
    { field: "supplierId", headerName: "Номер", width: 100 }
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
      <Buttons exportToExcel={exportToExcel} handleImportExcel={handleImportExcel} />

      <DataGrid
        initialState={{
          columns: {
            columnVisibilityModel: {
              supplierId: false,
            },
          },
        }}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Deliveries;