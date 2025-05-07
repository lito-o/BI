import React from "react";
import axios from "axios";
import * as XLSX from "xlsx";

import UniversalDataGrid from "../components/UniversalDataGrid";
import { getSuppliers } from "../services/api";

const numberColumn = (field, headerName, digits = 2) => ({
  field,
  headerName,
  width: 150,
  valueGetter: (value) => value !== undefined ? Number(value).toFixed(digits) : "N/A",
  type: "number",
});

const percentageColumn = (field, headerName, width = 100) => ({
  field,
  headerName,
  width,
  valueFormatter: (value) => value != null ? `${(value * 100).toFixed(2)} %` : "",
  type: "number",
});

const columns = [
  { field: "name", headerName: "Наименование", width: 150 },
  { field: "type", headerName: "Вид", width: 150 },
  { field: "unp", headerName: "УНП", width: 100 },
  { field: "unified_state_register", headerName: "ЕГР", type: "boolean", width: 150 },
  { field: "ministry_taxes_duties", headerName: "МНС", type: "boolean", width: 150 },
  { field: "country", headerName: "Страна", width: 100 },
  percentageColumn("quality_year", "Качество (год)"),
  percentageColumn("quality_total", "Качество (всё время)"),
  percentageColumn("on_time_percentage", "Процент вовремя"),
  numberColumn("replacement_days", "Срок замены", 0),
  numberColumn("assortment_count", "Ассортимент", 0),
  { field: "delivery_change", headerName: "Изменение срока", type: "boolean", width: 150 },
  numberColumn("avg_delivery_time", "Среднее время доставки", 0),
  numberColumn("received_quantity", "Количество поставок (год)", 0),
  { field: "category", headerName: "Категория", width: 150 },
];

const handleImportExcel = async (event, setSnackbar, setRows) => {
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

    const requiredFields = ["Наименование", "Вид", "Страна", "УНП"];
    const numberFields = ["Срок замены", "Ассортимент"];
    const errors = [];

    jsonData.forEach((row, idx) => {
      const rowNumber = idx + 2;

      requiredFields.forEach((header) => {
        if (!row[header] && row[header] !== 0) {
          errors.push(`Строка ${rowNumber}: отсутствует поле "${header}"`);
        }
        if (header === "УНП" && row[header] && !/^\d{9}$/.test(row[header])) {
          errors.push(`Строка ${rowNumber}: УНП должен состоять из 9 цифр`);
        }
      });

      numberFields.forEach((header) => {
        if (row[header] !== undefined && isNaN(Number(row[header]))) {
          errors.push(`Строка ${rowNumber}: поле "${header}" должно быть числом`);
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

    // Маппинг заголовков
    const mappedData = jsonData.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((header) => {
        const field = headerToFieldMap[header];
        newRow[field] = row[header];
      });
      return newRow;
    });

    const response = await axios.post("http://localhost:5000/api/suppliers", {
      suppliers: mappedData,
    });

    let message = `Импорт завершен. `;
    if (response.data.created.length > 0) {
      message += `Создано новых: ${response.data.created.length}. `;
    }
    if (response.data.updated.length > 0) {
      message += `Обновлено: ${response.data.updated.length}. `;
    }
    if (response.data.errors.length > 0) {
      message += `Ошибок: ${response.data.errors.length}.`;
    }

    setSnackbar({
      open: true,
      message,
      severity: response.data.errors.length ? "error" : "success",
    });

    const updatedSuppliers = await getSuppliers();
    setRows(updatedSuppliers);
  } catch (error) {
    console.error("Ошибка импорта:", error);
    setSnackbar({
      open: true,
      message: "Ошибка при импорте поставщиков. См. консоль.",
      severity: "error",
    });
  }
};

const Suppliers = () => (
  <UniversalDataGrid
    fetchData={getSuppliers}
    columns={columns}
    sheetName="Поставщики"
    localStorageKey="suppliers"
    importHandler={handleImportExcel}
  />
);

export default Suppliers;
