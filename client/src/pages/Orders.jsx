import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

import UniversalDataGrid from "../components/UniversalDataGrid";
import { getOrders, getClients } from "../services/api";

const numberColumn = (field, headerName, digits = 2) => ({
  field,
  headerName,
  width: 150,
  valueGetter: (value) => (value !== undefined ? Number(value).toFixed(digits) : "N/A"),
  type: "number",
});

const dateColumn = (field, headerName) => ({
  field,
  headerName,
  width: 180,
  type: "date",
  valueGetter: (value) => (value ? new Date(value) : null),
  valueFormatter: (value) => (value ? new Date(value).toLocaleDateString() : "N/A"),
});

const columns = [
  { field: "clientId", headerName: "Номер", width: 0 },
  { field: "order_number", headerName: "Номер заказа", width: 150 },
  dateColumn("request_date", "Дата обращения"),
  dateColumn("confirm_date", "Дата подтверждения"),
  { field: "confirm_status", headerName: "Статус подтверждения", width: 150 },
  numberColumn("application_processing_time", "Время обработки заявки (дн)"),
  dateColumn("order_ready_date", "Дата готовности заказа"),
  { field: "description", headerName: "Описание", width: 150 },
  numberColumn("total_amount", "Сумма заказа"),
  numberColumn("cost", "Стоимость"),
  numberColumn("profit", "Прибыль"),
  {
    field: "marginality",
    headerName: "Маржинальность",
    width: 120,
    type: "number",
    valueFormatter: (value) => (value != null ? `${(value * 100).toFixed(2)} %` : ""),
  },
  {
    field: "return_on_margin",
    headerName: "Рентабельность",
    width: 120,
    type: "number",
    valueFormatter: (value) => (value != null ? `${(value * 100).toFixed(2)} %` : ""),
  },
  numberColumn("paid_amount", "Оплачено"),
  numberColumn("left_to_pay", "Осталось оплатить"),
  dateColumn("payment_date", "Дата оплаты"),
  dateColumn("payment_term", "Срок оплаты"),
  numberColumn("order_payment_time", "Время оплаты заказа (дн)", 0),
  { field: "payment_term_status", headerName: "Сроки оплаты", width: 150, type: "boolean" },
  dateColumn("dispatch_date", "Дата отправки"),
  dateColumn("delivery_date", "Дата доставки"),
  dateColumn("delivery_term", "Срок доставки"),
  numberColumn("delivery_time", "Время доставки (дн)", 0),
  { field: "delivery_status", headerName: "Сроки доставки", width: 150, type: "boolean" },
  numberColumn("order_completion_time", "Время выполнения заказа (дн)"),
  { field: "status", headerName: "Статус заказа", width: 120 },
  { field: "clientName", headerName: "Клиент", width: 150 },
];

const handleImportExcel = (clients) => async (event, setSnackbar, setRows) => {
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

    const clientIds = clients.map((c) => c.id);
    const requiredFields = ["Номер заказа", "Описание", "Дата обращения", "Номер"];
    const numberFields = ["Сумма заказа", "Оплачено", "Стоимость"];
    const dateFields = ["Дата обращения", "Дата оплаты", "Дата доставки"];
    const errors = [];

    const transformedData = jsonData.map((row, idx) => {
      const rowNumber = idx + 2;
      const newRow = {};

      Object.keys(row).forEach((header) => {
        const field = headerToFieldMap[header];
        if (field) newRow[field] = row[header];
      });

      requiredFields.forEach((header) => {
        if (!row[header] && row[header] !== 0) {
          errors.push(`Строка ${rowNumber}: отсутствует обязательное поле "${header}"`);
        }
      });

      const clientId = newRow["clientId"];
      if (clientId && !clientIds.includes(clientId)) {
        errors.push(`Строка ${rowNumber}: клиент с id "${clientId}" не найден`);
      }

      numberFields.forEach((header) => {
        const value = row[header];
        if (value !== undefined && isNaN(Number(value))) {
          errors.push(`Строка ${rowNumber}: поле "${header}" должно быть числом`);
        }
      });

      dateFields.forEach((header) => {
        const value = row[header];
        if (value && isNaN(new Date(value).getTime())) {
          errors.push(`Строка ${rowNumber}: поле "${header}" должно быть валидной датой`);
        }
      });

      return newRow;
    });

    if (errors.length > 0) {
      setSnackbar({
        open: true,
        message: `Найдены ошибки в Excel-файле:\n${errors.join("\n")}`,
        severity: "error",
      });
      return;
    }

    const enriched = transformedData.map((row) => {
      const client = clients.find((c) => c.id === row.clientId);
      return {
        ...row,
        clientName: client?.name || "Неизвестно",
      };
    });

    const response = await axios.post("http://localhost:5000/api/orders", {
      orders: enriched,
    });

    let message = `Импорт завершен. `;
    if (response.data.created.length > 0) {
      message += `Создано заказов: ${response.data.created.length}. `;
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

    const updated = await getOrders();
    const formatted = updated.map((order) => ({
      ...order,
      id: order.id,
      clientName: order.Client?.name || order.client?.name || "Неизвестно",
    }));
    setRows(formatted);
  } catch (error) {
    console.error("Ошибка импорта:", error);
    setSnackbar({
      open: true,
      message: "Ошибка при импорте заказов. См. консоль.",
      severity: "error",
    });
  }
};

const Orders = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      const response = await getClients();
      setClients(response);
    };
    fetch();
  }, []);

  return (
    <UniversalDataGrid
      fetchData={async () => {
        const raw = await getOrders();
        return raw.map((order) => ({
          ...order,
          id: order.id,
          clientName: order.Client?.name || order.client?.name || "Неизвестно",
        }));
      }}
      columns={columns}
      sheetName="Заказы"
      localStorageKey="orders"
      importHandler={handleImportExcel(clients)}
    />
  );
};

export default Orders;
