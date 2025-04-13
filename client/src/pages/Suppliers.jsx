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
import { getSuppliers } from "../services/api";
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

const Suppliers = () => {
  const apiRef = useGridApiRef();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterModel, setFilterModel] = useState(() => {
    const saved = localStorage.getItem("suppliersFilterModel");
    return saved ? JSON.parse(saved) : { items: [], logicOperator: "and" };
  });
  const [sortModel, setSortModel] = useState(() => {
    const saved = localStorage.getItem("suppliersSortModel");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getSuppliers();
        if (!response) throw new Error("Пустой ответ от сервера");
        if (!Array.isArray(response)) throw new Error("Ожидался массив поставщиков");
        setSuppliers(response);
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
    localStorage.setItem("suppliersFilterModel", JSON.stringify(filterModel));
  }, [filterModel]);

  useEffect(() => {
    localStorage.setItem("suppliersSortModel", JSON.stringify(sortModel));
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
    XLSX.utils.book_append_sheet(wb, ws, "Suppliers");
    XLSX.writeFile(wb, "suppliers.xlsx");
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
        "Наименование", "Вид", "Страна", "УНП"
      ];

      const numberFields = [
        "Срок замены", "Ассортимент"
      ];

      const errors = [];

      jsonData.forEach((row, idx) => {
        const rowNumber = idx + 2;

        requiredFields.forEach(headerName => {
          const field = fieldToHeaderMap[headerName];
          if (!row[headerName] && row[headerName] !== 0) {
            errors.push(`Строка ${rowNumber}: отсутствует поле "${headerName}"`);
          }
          if (row.unp && !/^\d{9}$/.test(row.unp)) {
            errors.push(`Строка ${rowNumber}: УНП должен состоять из 9 цифр`);
          }
        });

        numberFields.forEach(headerName => {
          const field = fieldToHeaderMap[headerName];
          if (row[headerName] !== undefined && isNaN(Number(row[headerName]))) {
            errors.push(`Строка ${rowNumber}: поле "${headerName}" должно быть числом`);
          }
        });
      });

      if (errors.length > 0) {
        alert("Найдены ошибки в Excel-файле:\n" + errors.join("\n"));
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

      const response = await axios.post("http://localhost:5000/api/suppliers", {
        suppliers: mappedJsonData,
      });

      alert(`Импортировано поставщиков: ${response.data.length}`);
      const updatedSuppliers = await getSuppliers();
      setSuppliers(updatedSuppliers);
    } catch (error) {
      console.error("Ошибка импорта:", error);
      alert("Ошибка при импорте поставщиков. См. консоль.");
    }
  };

  const numberColumn = (field, headerName, digits = 2) => ({
    field,
    headerName,
    width: 150,
    valueGetter: (value) =>
      value !== undefined ? Number(value).toFixed(digits) : "N/A",
    type: "number",
  });

  const percentageColumn = (field, headerName, width = 100) => ({
    field,
    headerName,
    width,
    valueFormatter: (value) =>
      value != null ? `${(value * 100).toFixed(2)} %` : '',
    type: "number",
  });

  const columns = [
    { field: 'name', headerName: 'Наименование', width: 150 },
    { field: 'type', headerName: 'Вид', width: 150 },
    { field: 'country', headerName: 'Страна', width: 100 },
    { field: 'unp', headerName: 'УНП', width: 100 },
    { field: 'unified_state_register', headerName: 'ЕГР', type: 'boolean', width: 150 },
    { field: 'ministry_taxes_duties', headerName: 'МНС', type: 'boolean', width: 150 },
    percentageColumn('defective_rate_year', 'Качество (год)'),
    percentageColumn('defective_rate_total', 'Качество (всё время)'),
    percentageColumn('on_time_percentage', 'Процент вовремя'),
    numberColumn('replacement_days', 'Срок замены', 0),
    numberColumn('assortment_count', 'Ассортимент', 0),
    { field: 'delivery_change', headerName: 'Изменение срока', type: 'boolean', width: 150 },
    numberColumn('avg_delivery_time', 'Среднее время доставки', 0),
    numberColumn('received_quantity', 'Количество поставок', 0),
    percentageColumn('rejected_rate_year', 'Доля отклоненного товара', 150),
    { field: 'category', headerName: 'Категория', width: 150 },
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
        sx={{ width: "90px", mt: "18px", mb: "10px", backgroundColor: "#252525" }}
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
    rows={suppliers}
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
export default Suppliers;