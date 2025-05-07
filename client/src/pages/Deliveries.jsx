import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

import UniversalDataGrid from "../components/UniversalDataGrid";
import { getDeliveries, getSuppliers } from "../services/api";

const numberColumn = (field, headerName, digits = 2) => ({
  field,
  headerName,
  width: 130,
  valueGetter: (value) => value !== undefined ? Number(value).toFixed(digits) : "N/A",
  type: "number",
});

const dateColumn = (field, headerName) => ({
  field,
  headerName,
  width: 130,
  type: "date",
  valueGetter: (value) => value ? new Date(value) : null,
  valueFormatter: (value) => value ? new Date(value).toLocaleDateString() : "N/A",
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
    valueFormatter: (value) => value == null ? "100 %" : `${(value * 100).toFixed(2)} %`,
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
  { field: "supplierId", headerName: "Номер", width: 100 },
];

const handleImportExcel = (suppliers) => async (event, setSnackbar, setRows) => {
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

    const requiredFields = ["Номер поставки", "Артикул", "Наименование", "Количество", "Цена за единицу", "Номер"];
    const numberFields = ["Количество", "Количество брака", "Цена за единицу"];
    const dateFields = ["Дата покупки", "Дата поступления", "Срок доставки"];
    const supplierIds = suppliers.map((s) => s.id);
    const errors = [];

    jsonData.forEach((row, idx) => {
      const rowNumber = idx + 2;

      requiredFields.forEach((header) => {
        if (!row[header] && row[header] !== 0) {
          errors.push(`Строка ${rowNumber}: отсутствует поле "${header}"`);
        }
      });

      const supplierId = row["Номер"];
      if (!supplierIds.includes(supplierId)) {
        errors.push(`Строка ${rowNumber}: поставщик с ID ${supplierId} не найден`);
      }

      numberFields.forEach((header) => {
        if (row[header] !== undefined && isNaN(Number(row[header]))) {
          errors.push(`Строка ${rowNumber}: поле "${header}" должно быть числом`);
        }
      });

      dateFields.forEach((header) => {
        if (row[header] && isNaN(new Date(row[header]).getTime())) {
          errors.push(`Строка ${rowNumber}: поле "${header}" должно быть валидной датой`);
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

    // Преобразование строк в формат API
    const mappedData = jsonData.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((header) => {
        const field = headerToFieldMap[header];
        newRow[field] = row[header];
      });
      return newRow;
    });

    const response = await axios.post("http://localhost:5000/api/deliveries", {
      deliveries: mappedData,
    });

    let message = `Импорт завершен. `;
    if (response.data.created.length > 0) {
      message += `Создано поставок: ${response.data.created.length}. `;
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

    const updated = await getDeliveries();
    const formatted = updated.map((delivery) => ({
      ...delivery,
      id: delivery.id,
      supplierName: delivery.Supplier?.name || delivery.supplier?.name || "Неизвестно",
      quality_of_delivery: delivery.defective_quantity
        ? 1 - delivery.defective_quantity / delivery.quantity
        : null,
    }));
    setRows(formatted);
  } catch (error) {
    console.error("Ошибка импорта:", error);
    setSnackbar({
      open: true,
      message: "Ошибка при импорте поставок. См. консоль.",
      severity: "error",
    });
  }
};

const Deliveries = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const res = await getSuppliers();
      setSuppliers(res);
    };
    fetch();
  }, []);

  return (
    <UniversalDataGrid
      fetchData={async () => {
        const raw = await getDeliveries();
        return raw.map((delivery) => ({
          ...delivery,
          id: delivery.id,
          supplierName: delivery.Supplier?.name || delivery.supplier?.name || "Неизвестно",
          quality_of_delivery: delivery.defective_quantity
            ? 1 - delivery.defective_quantity / delivery.quantity
            : null,
        }));
      }}
      columns={columns}
      sheetName="Поставки"
      localStorageKey="deliveries"
      importHandler={handleImportExcel(suppliers)}
    />
  );
};

export default Deliveries;
