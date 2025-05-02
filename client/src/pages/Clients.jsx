import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DataGrid,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid";
import { LinearProgress, Alert, Snackbar } from "@mui/material";
import { getClients } from "../services/api";
import * as XLSX from "xlsx";
import CustomToolbar from "../components/CustomToolbar";
import Buttons from "../components/Buttons";

const Clients = () => {
  const apiRef = useGridApiRef();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [filterModel, setFilterModel] = useState(() => {
    const saved = localStorage.getItem("clientsFilterModel");
    return saved ? JSON.parse(saved) : { items: [], logicOperator: "and" };
  });

  const [sortModel, setSortModel] = useState(() => {
    const saved = localStorage.getItem("clientsSortModel");
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
        const data = await getClients();
        if (!data) throw new Error("Пустой ответ от сервера");
        if (!Array.isArray(data)) throw new Error("Ожидался массив клиентов");
        setClients(data);
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
    localStorage.setItem("clientsFilterModel", JSON.stringify(filterModel));
  }, [filterModel]);

  useEffect(() => {
    localStorage.setItem("clientsSortModel", JSON.stringify(sortModel));
  }, [sortModel]);

  const exportToExcel = () => {
    if (!apiRef.current) return;
    const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    const visibleColumns = gridVisibleColumnFieldsSelector(apiRef);

    const exportData = filteredSortedRowIds.map((id) => {
      const row = apiRef.current.getRow(id);
      const rowData = {};
      visibleColumns.forEach((field) => {
        const column = columns.find((col) => col.field === field);
        if (!column) return;
        let value = row[field];
        if (column.valueGetter) {
          value = column.valueGetter(value, row);
        }
        rowData[column.headerName] = value !== undefined ? value : "";
      });
      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "Клиенты.xlsx");
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
  
      const headerToFieldMap = {};
      columns.forEach((col) => {
        headerToFieldMap[col.headerName] = col.field;
      });
  
      const normalizeBoolean = (value) => {
        if (value === undefined || value === null) return undefined;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
          const lowerVal = value.toLowerCase().trim();
          if (lowerVal === 'true') return true;
          if (lowerVal === 'false') return false;
        }
        return undefined;
      };
  
      const transformedData = jsonData.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((header) => {
          const field = headerToFieldMap[header];
          if (field) {
            if (field === 'unified_state_register' || field === 'ministry_taxes_duties') {
              newRow[field] = normalizeBoolean(row[header]);
            } else {
              newRow[field] = row[header];
            }
          } else {
            console.warn(`Неизвестный заголовок: ${header}`);
          }
        });
        return newRow;
      });
  
      const requiredFields = [
        "Наименование", 
        "Вид", 
        "Страна",
        "УНП",
        "ЕГР",
        "МНС"
      ];
  
      const numberFields = [
        "Средний чек",
        "Дебиторская задолженность",
        "Среднее время оплаты"
      ];
  
      const errors = [];
  
      jsonData.forEach((row, idx) => {
        const rowNumber = idx + 2;
        
        requiredFields.forEach((headerName) => {
          if (!row[headerName] && row[headerName] !== 0) {
            errors.push(`Строка ${rowNumber}: отсутствует обязательное поле "${headerName}"`);
          }
        });
  
        if (row["УНП"] && !/^\d{9}$/.test(row["УНП"])) {
          errors.push(`Строка ${rowNumber}: УНП должен состоять из 9 цифр`);
        }
  
        numberFields.forEach((headerName) => {
          if (row[headerName] !== undefined && isNaN(Number(row[headerName]))) {
            errors.push(`Строка ${rowNumber}: поле "${headerName}" должно быть числом`);
          }
        });
  
        const egrValue = row["ЕГР"];
        const mnsValue = row["МНС"];
        
        if (egrValue !== undefined && normalizeBoolean(egrValue) === undefined) {
          errors.push(`Строка ${rowNumber}: поле "ЕГР" должно быть TRUE или FALSE (получено: ${egrValue})`);
        }
        
        if (mnsValue !== undefined && normalizeBoolean(mnsValue) === undefined) {
          errors.push(`Строка ${rowNumber}: поле "МНС" должно быть TRUE или FALSE (получено: ${mnsValue})`);
        }
      });
  
      if (errors.length > 0) {
        setSnackbar({
          open: true,
          message: `Найдены ошибки в Excel-файле:\n${errors.join("\n")}`,
          severity: "error",
        });
        return;
      }
  
      const response = await axios.post("http://localhost:5000/api/clients", {
        clients: transformedData,
      });
  
      let message = `Импорт завершен. `;
      if (response.data.created.length > 0) {
        message += `Создано новых клиентов: ${response.data.created.length}. `;
      }
      if (response.data.updated.length > 0) {
        message += `Обновлено существующих клиентов: ${response.data.updated.length}. `;
      }
      if (response.data.errors.length > 0) {
        message += `Ошибок при обработке: ${response.data.errors.length}.`;
      }
  
      setSnackbar({
        open: true,
        message: message,
        severity: response.data.errors.length ? "error" : "success",
      });
  
      const updatedClients = await getClients();
      setClients(updatedClients);
    } catch (error) {
      console.error("Ошибка импорта:", error);
      setSnackbar({
        open: true,
        message: "Ошибка при импорте клиентов. См. консоль.",
        severity: "error",
      });
    }
  };

  const numberColumn = (field, headerName, digits = 2) => ({
    field,
    headerName,
    width: 150,
    valueGetter: (value) => (value !== undefined ? Number(value).toFixed(digits) : "N/A"),
    type: "number",
  });

  const columns = [
    { field: "name", headerName: "Наименование", width: 200 },
    { field: "type", headerName: "Вид", width: 150 },
    { field: "unp", headerName: "УНП", width: 150 },
    { field: "unified_state_register", headerName: "ЕГР", type: "boolean", width: 150 },
    { field: "ministry_taxes_duties", headerName: "МНС", type: "boolean", width: 150 },
    { field: "country", headerName: "Страна", width: 150 },
    numberColumn("avg_check", "Средний чек"),
    numberColumn("debt", "Дебиторская задолженность"),
    numberColumn("avg_payment_time", "Среднее время оплаты", 1),
  ];

  return (
    <div style={{ height: 750, width: "100%" }}>
      <Buttons exportToExcel={exportToExcel} handleImportExcel={handleImportExcel} />

      <DataGrid
        apiRef={apiRef}
        rows={clients}
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

export default Clients;