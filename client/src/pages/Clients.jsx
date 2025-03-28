import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
} from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { getClients, getClientOrders } from "../services/api";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await getClients();
      setClients(data);
    };
    fetchData();
  }, []);

  const toggleRow = async (clientId) => {
    setExpandedRows((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
    if (!expandedRows[clientId]) {
      const orders = await getClientOrders(clientId);
      setClients((prev) =>
        prev.map((client) =>
          client.id === clientId ? { ...client, orders } : client
        )
      );
    }
  };

  // Функция для безопасного отображения значений
  const renderValue = (value) => {
    if (value === undefined || value === null) return '-';
    if (typeof value === 'object') return JSON.stringify(value);
    return value;
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {["Наименование", "Вид", "УНП", "Средний чек", "Дебиторская задолженность", "Среднее время оплаты", "Активность"].map(
              (column) => (
                <TableCell key={column}>{column}</TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {clients.map((client) => (
            <React.Fragment key={client.id}>
              <TableRow>
                <TableCell>
                  <IconButton size="small" onClick={() => toggleRow(client.id)}>
                    {expandedRows[client.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </TableCell>
                <TableCell>{renderValue(client.name)}</TableCell>
                <TableCell>{renderValue(client.type)}</TableCell>
                <TableCell>{renderValue(client.unp)}</TableCell>
                <TableCell>{renderValue(client.avg_check)}</TableCell>
                <TableCell>{renderValue(client.debt)}</TableCell>
                <TableCell>{renderValue(client.avg_payment_time)} дней</TableCell>
                <TableCell>{renderValue(client.activity_status)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={8} sx={{ paddingBottom: 0, paddingTop: 0 }}>
                  <Collapse in={expandedRows[client.id]} timeout="auto" unmountOnExit>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {["Дата обращения", "Сумма", "Оплачено", "Осталось оплатить", "Статус"].map((column) => (
                            <TableCell key={column}>{column}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {client.orders?.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{order.request_date ? new Date(order.request_date).toLocaleDateString() : '-'}</TableCell>
                            <TableCell>{order.total_amount?.toFixed?.(2)}</TableCell>
                            <TableCell>{order.paid_amount?.toFixed?.(2)}</TableCell>
                            <TableCell>{(order.total_amount - order.paid_amount)?.toFixed?.(2)}</TableCell>
                            <TableCell>{order.status || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Clients;