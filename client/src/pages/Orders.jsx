import React, { useEffect, useState } from "react";
import {
  DataGrid,
  GridToolbarQuickFilter,
  GridToolbarContainer,
  useGridApiRef,
  gridFilteredSortedRowIdsSelector,
  gridVisibleColumnFieldsSelector,
} from "@mui/x-data-grid";
import { LinearProgress, Alert, Button } from "@mui/material";
import { getOrders } from "../services/api";
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

const Orders = () => {
  const apiRef = useGridApiRef();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterModel, setFilterModel] = useState(() => {
    const saved = localStorage.getItem("ordersFilterModel");
    return saved ? JSON.parse(saved) : { items: [], logicOperator: "and" };
  });

  const [sortModel, setSortModel] = useState(() => {
    const saved = localStorage.getItem("ordersSortModel");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getOrders();

        if (!response) throw new Error("Пустой ответ от сервера");
        if (!Array.isArray(response)) throw new Error("Ожидался массив заказов");

        const formattedOrders = response.map(order => ({
          ...order,
          id: order.id,
          clientName: order.Client?.name || order.client?.name || "Неизвестно"
        }));

        setOrders(formattedOrders);
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
    localStorage.setItem("ordersFilterModel", JSON.stringify(filterModel));
  }, [filterModel]);

  useEffect(() => {
    localStorage.setItem("ordersSortModel", JSON.stringify(sortModel));
  }, [sortModel]);

  const exportToExcel = () => {
    if (!apiRef.current) return;

    // Получаем ID отфильтрованных и отсортированных строк
    const filteredSortedRowIds = gridFilteredSortedRowIdsSelector(apiRef);
    
    // Получаем список видимых колонок
    const visibleColumns = gridVisibleColumnFieldsSelector(apiRef);

    // Создаем массив данных для экспорта
    const exportData = filteredSortedRowIds.map(id => {
      const row = apiRef.current.getRow(id);
      const rowData = {};
      
      visibleColumns.forEach(field => {
        const column = columns.find(col => col.field === field);
        if (!column) return;

        // Получаем значение с учетом valueGetter
        let value = row[field];
        if (column.valueGetter) {
          value = column.valueGetter(value, row);
        }

        // Форматируем значение с учетом valueFormatter
        // if (column.valueFormatter) {
        //   value = column.valueFormatter({
        //     value,
        //     field,
        //     row
        //   });
        // }

        rowData[field] = value !== undefined ? value : '';
      });

      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Orders");
    XLSX.writeFile(wb, "orders.xlsx");
  };

  const dateColumn = (field, headerName) => ({
    field,
    headerName,
    width: 180,
    type: "date",
    valueGetter: (value) =>
      value ? new Date(value) : null,
    valueFormatter: (value) =>
      value ? new Date(value).toLocaleString() : "N/A",
  });

  const numberColumn = (field, headerName, digits = 2) => ({
    field,
    headerName,
    width: 150,
    valueGetter: (value) =>
      value !== undefined ? Number(value).toFixed(digits) : "N/A",
    type: "number",
  });

  const columns = [
    dateColumn("request_date", "Дата обращения"),
    dateColumn("confirm_date", "Дата подтверждения"),
    {
      field: "confirm_status",
      headerName: "Статус подтверждения",
      width: 150,
    },
    numberColumn("application_processing_time", "Время обработки заявки (дн)"),
    dateColumn("order_ready_date", "Дата готовности заказа"),
    {
      field: "description",
      headerName: "Описание",
      width: 150,
    },
    numberColumn("total_amount", "Сумма заказа"),
    numberColumn("general_costs", "Расходы на реализацию"),
    numberColumn("cost_price", "Себестоимость"),
    {
      field: "currency",
      headerName: "Валюта",
      width: 80,
    },
    {
      field: "marginality",
      headerName: "Маржинальность",
      width: 120,
      type: "number",
      valueFormatter: (value) =>
        value != null ? `${(value * 100).toFixed(2)} %` : '',
    },
    numberColumn("profit", "Прибыль"),
    {
      field: "return_on_margin",
      headerName: "Рентабельность",
      width: 120,
      type: "number",
      valueFormatter: (value) =>
        value != null ? `${(value * 100).toFixed(2)} %` : '',
    },
    numberColumn("paid_amount", "Оплачено"),
    numberColumn("left_to_pay", "Осталось оплатить"),
    dateColumn("payment_date", "Дата оплаты"),
    dateColumn("payment_term", "Срок оплаты"),
    numberColumn("order_payment_time", "Время оплаты заказа (дн)", 0),
    {
      field: "payment_term_status",
      headerName: "Соответствие срокам оплаты",
      width: 180,
      type: "boolean",
    },
    dateColumn("delivery_time", "Срок доставки"),
    dateColumn("delivery_date", "Дата доставки"),
    {
      field: "delivery_status",
      headerName: "Соответствие срокам доставки",
      width: 180,
      type: "boolean",
    },
    numberColumn("order_completion_time", "Время выполнения заказа (дн)"),
    {
      field: "status",
      headerName: "Статус заказа",
      width: 120,
    },
    {
      field: "clientName",
      headerName: "Клиент",
      width: 150,
    }
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
        sx={{mt: "18px", mb: "10px", backgroundColor: "#252525"}}
      >
        Экспорт
      </Button>
      <DataGrid
        apiRef={apiRef}
        rows={orders}
        columns={columns}
        loading={loading}
        pageSize={10}
        rowsPerPageOptions={[10]}
        getRowId={(row) => row.id}
        components={{
          LoadingOverlay: LinearProgress,
          Toolbar: CustomToolbar,
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

export default Orders;