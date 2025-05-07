import React, { useEffect, useState } from "react";
import {
  DataGrid,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid";

import { LinearProgress, Alert, Snackbar } from "@mui/material";
import * as XLSX from "xlsx";
import Buttons from "./Buttons";
import CustomToolbar from "./CustomToolbar";

const UniversalDataGrid = ({
  fetchData,
  columns,
  sheetName,
  importHandler,
  localStorageKey,
  initialState,
  formatRowData = (row) => row
}) => {
  const apiRef = useGridApiRef();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [filterModel, setFilterModel] = useState(() => {
    const saved = localStorage.getItem(`${localStorageKey}FilterModel`);
    return saved ? JSON.parse(saved) : { items: [], logicOperator: "and" };
  });

  const [sortModel, setSortModel] = useState(() => {
    const saved = localStorage.getItem(`${localStorageKey}SortModel`);
    return saved ? JSON.parse(saved) : [];
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchData();
        setRows(data);
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
        setSnackbar({
          open: true,
          message: `Ошибка загрузки данных: ${error.message}`,
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchData]);

  useEffect(() => {
    localStorage.setItem(`${localStorageKey}FilterModel`, JSON.stringify(filterModel));
  }, [filterModel, localStorageKey]);
  
  useEffect(() => {
    localStorage.setItem(`${localStorageKey}SortModel`, JSON.stringify(sortModel));
  }, [sortModel, localStorageKey]);  

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
      return formatRowData(rowData);
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${sheetName}.xlsx`);
  };

  return (
    <div style={{ height: 750, width: "100%" }}>
      <Buttons
        exportToExcel={exportToExcel}
        handleImportExcel={(event) => importHandler(event, setSnackbar, setRows)}
        />

      <DataGrid
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.id}
        pageSize={10}
        rowsPerPageOptions={[10]}
        slots={{
          loadingOverlay: LinearProgress,
          toolbar: CustomToolbar,
        }}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        sortingOrder={["asc", "desc"]}
        initialState={initialState}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default UniversalDataGrid;
