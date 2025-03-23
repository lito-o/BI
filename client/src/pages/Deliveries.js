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
import { getDeliveries } from "../services/api";

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDeliveries();
      setDeliveries(data);
    };
    fetchData();
  }, []);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedData = [...deliveries].sort((a, b) => {
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
              "Артикул",
              "Наименование",
              "Количество",
              "Цена за единицу",
              "Общая стоимость",
              "Дата покупки",
              "Дата поступления",
              "Срок доставки",
              "Статус",
              "Поставщик",
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
          {sortedData.map((delivery) => (
            <TableRow key={delivery.id}>
              <TableCell>{delivery.article}</TableCell>
              <TableCell>{delivery.name}</TableCell>
              <TableCell>{delivery.quantity}</TableCell>
              <TableCell>{delivery.price_per_unit.toFixed(2)}</TableCell>
              <TableCell>{delivery.total_price.toFixed(2)}</TableCell>
              <TableCell>{new Date(delivery.purchase_date).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(delivery.arrival_date).toLocaleDateString()}</TableCell>
              <TableCell>{delivery.delivery_days} дней</TableCell>
              <TableCell>{delivery.status}</TableCell>
              <TableCell>{delivery.supplier.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Deliveries;
