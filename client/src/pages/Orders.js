import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { getOrders } from "../services/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("request_date");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getOrders();
      setOrders(data);
    };
    fetchData();
  }, []);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = [...orders].sort((a, b) => {
    if (a[orderBy] < b[orderBy]) return order === "asc" ? -1 : 1;
    if (a[orderBy] > b[orderBy]) return order === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {[
              "Дата обращения",
              "Дата подтверждения",
              "Статус",
              "Описание",
              "Сумма",
              "Себестоимость",
              "Прибыль",
              "Оплачено",
              "Осталось оплатить",
              "Статус доставки",
              "Клиент",
            ].map((column) => (
              <TableCell key={column}>
                <TableSortLabel
                  active={orderBy === column}
                  direction={order}
                  onClick={() => handleSort(column)}
                >
                  {column}
                </TableSortLabel>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{new Date(order.request_date).toLocaleDateString()}</TableCell>
              <TableCell>{order.confirm_date ? new Date(order.confirm_date).toLocaleDateString() : "—"}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{order.description}</TableCell>
              <TableCell>{order.total_amount.toFixed(2)}</TableCell>
              <TableCell>{order.cost_price.toFixed(2)}</TableCell>
              <TableCell>{order.profit.toFixed(2)}</TableCell>
              <TableCell>{order.paid_amount.toFixed(2)}</TableCell>
              <TableCell>{(order.total_amount - order.paid_amount).toFixed(2)}</TableCell>
              <TableCell>{order.delivery_status}</TableCell>
              {/* <TableCell>{order.client.name}</TableCell> */}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Orders;

