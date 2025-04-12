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
import { getClients } from "../services/api";
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
    XLSX.utils.book_append_sheet(wb, ws, "Clients");
    XLSX.writeFile(wb, "clients.xlsx");
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const requiredFields = ["name", "type", "unp"];
      const errors = [];
      
      jsonData.forEach((row, idx) => {
        const rowNumber = idx + 2;
        
        requiredFields.forEach(field => {
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
        clients: jsonData,
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
    width: 200,
    valueGetter: (value) => value !== undefined ? Number(value).toFixed(digits) : "N/A",
    type: "number",
  });

  const columns = [
    {
      field: "name",
      headerName: "Наименование",
      width: 200,
    },
    {
      field: "type",
      headerName: "Вид",
      width: 120,
    },
    {
      field: "unp",
      headerName: "УНП",
      width: 120,
    },
    {
      field: "unified_state_register",
      headerName: "ЕГР",
      width: 120,
      valueFormatter: (value) => value ? 'Действующий' : 'Исключен',
    },
    {
      field: "ministry_taxes_duties",
      headerName: "МНС",
      width: 120,
      valueFormatter: (value) => value ? 'Действующий' : 'Ликвидирован',
    },
    {
      field: "country",
      headerName: "Страна",
      width: 120,
    },
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