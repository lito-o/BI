import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  DataGrid,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid";
import { LinearProgress, Alert } from "@mui/material";
import { getClients } from "../services/api";
import * as XLSX from "xlsx";
import CustomToolbar from "../components/CustomToolbar";
import Buttons from "../components/Buttons";

const Clients = () => {
  const apiRef = useGridApiRef();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterModel, setFilterModel] = useState(() => {
    const saved = localStorage.getItem("clientsFilterModel");
    return saved ? JSON.parse(saved) : { items: [], logicOperator: "and" };
  });

  const [sortModel, setSortModel] = useState(() => {
    const saved = localStorage.getItem("clientsSortModel");
    return saved ? JSON.parse(saved) : [];
  });

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
        // Используем headerName как ключ для экспорта
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

      // Создаем маппинг из headerName в field
      const headerToFieldMap = {};
      columns.forEach((col) => {
        headerToFieldMap[col.headerName] = col.field;
      });

      // Преобразуем ключи в данных
      const transformedData = jsonData.map((row) => {
        const newRow = {};
        Object.keys(row).forEach((header) => {
          const field = headerToFieldMap[header];
          if (field) {
            newRow[field] = row[header];
          } else {
            console.warn(`Неизвестный заголовок: ${header}`);
          }
        });
        return newRow;
      });

      const requiredFields = ["name", "type", "unp"];
      const errors = [];

      transformedData.forEach((row, idx) => {
        const rowNumber = idx + 2;
        requiredFields.forEach((field) => {
          if (!row[field]) {
            errors.push(`Строка ${rowNumber}: отсутствует обязательное поле "${field}"`);
          }
        });
        if (row.unp && !/^\d{9}$/.test(row.unp)) {
          errors.push(`Строка ${rowNumber}: УНП должен состоять из 9 цифр`);
        }
      });

      if (errors.length > 0) {
        alert("Найдены ошибки в Excel-файле:\n" + errors.join("\n"));
        return;
      }

      const response = await axios.post("http://localhost:5000/api/clients", {
        clients: transformedData,
      });

      alert(`Импортировано клиентов: ${response.data.length}`);
      const updatedClients = await getClients();
      setClients(updatedClients);
    } catch (error) {
      console.error("Ошибка импорта:", error);
      alert("Ошибка при импорте клиентов. См. консоль.");
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
    { field: "name", headerName: "Наименование", width: 200, },
    { field: "type", headerName: "Вид", width: 150, },
    { field: "unp", headerName: "УНП", width: 150, },
    {
      field: "unified_state_register",
      headerName: "ЕГР",
      width: 150,
      valueFormatter: (value) => (value ? "Действующий" : "Исключен"),
    },
    {
      field: "ministry_taxes_duties",
      headerName: "МНС",
      width: 150,
      valueFormatter: (value) => (value ? "Действующий" : "Ликвидирован"),
    },
    { field: "country", headerName: "Страна", width: 150, },
    numberColumn("avg_check", "Средний чек"),
    numberColumn("debt", "Дебиторская задолженность"),
    numberColumn("avg_payment_time", "Среднее время оплаты", 1),
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
    </div>
  );
};

export default Clients;
