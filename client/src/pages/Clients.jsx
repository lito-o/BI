import React from "react";
import axios from "axios";
import * as XLSX from "xlsx";

import UniversalDataGrid from "../components/UniversalDataGrid";
import { getClients } from "../services/api";

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

    const normalizeBoolean = (value) => {
      if (value === undefined || value === null) return undefined;
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const lowerVal = value.toLowerCase().trim();
        if (lowerVal === "true") return true;
        if (lowerVal === "false") return false;
      }
      return undefined;
    };

    const transformedData = jsonData.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((header) => {
        const field = headerToFieldMap[header];
        if (field) {
          if (field === "unified_state_register" || field === "ministry_taxes_duties") {
            newRow[field] = normalizeBoolean(row[header]);
          } else {
            newRow[field] = row[header];
          }
        }
      });
      return newRow;
    });

    const requiredFields = ["Наименование", "Вид", "Страна", "УНП", "ЕГР", "МНС"];
    const numberFields = ["Средний чек", "Дебиторская задолженность", "Среднее время оплаты"];
    const errors = [];

    jsonData.forEach((row, idx) => {
      const rowNumber = idx + 2;
      requiredFields.forEach((header) => {
        if (!row[header] && row[header] !== 0) {
          errors.push(`Строка ${rowNumber}: отсутствует обязательное поле "${header}"`);
        }
      });
      if (row["УНП"] && !/^\d{9}$/.test(row["УНП"])) {
        errors.push(`Строка ${rowNumber}: УНП должен состоять из 9 цифр`);
      }
      numberFields.forEach((header) => {
        if (row[header] !== undefined && isNaN(Number(row[header]))) {
          errors.push(`Строка ${rowNumber}: поле "${header}" должно быть числом`);
        }
      });
      const egr = row["ЕГР"];
      const mns = row["МНС"];
      if (egr !== undefined && normalizeBoolean(egr) === undefined) {
        errors.push(`Строка ${rowNumber}: поле "ЕГР" должно быть TRUE или FALSE (получено: ${egr})`);
      }
      if (mns !== undefined && normalizeBoolean(mns) === undefined) {
        errors.push(`Строка ${rowNumber}: поле "МНС" должно быть TRUE или FALSE (получено: ${mns})`);
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
      message += `Обновлено клиентов: ${response.data.updated.length}. `;
    }
    if (response.data.errors.length > 0) {
      message += `Ошибок при обработке: ${response.data.errors.length}.`;
    }

    setSnackbar({
      open: true,
      message,
      severity: response.data.errors.length ? "error" : "success",
    });

    const updatedClients = await getClients();
    setRows(updatedClients);
  } catch (error) {
    console.error("Ошибка импорта:", error);
    setSnackbar({
      open: true,
      message: "Ошибка при импорте клиентов. См. консоль.",
      severity: "error",
    });
  }
};

const Clients = () => (
  <UniversalDataGrid
    fetchData={getClients}
    columns={columns}
    sheetName="Клиенты"
    localStorageKey="clients"
    importHandler={(e, setSnackbar, setRows) => handleImportExcel(e, setSnackbar, setRows)}
  />
);

export default Clients;
