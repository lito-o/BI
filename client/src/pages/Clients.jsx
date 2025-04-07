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
  const [expandedClientId, setExpandedClientId] = useState(null);
  const [orders, setOrders] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      const data = await getClients();
      setClients(data);
    };
    fetchData();
  }, []);

  const toggleRow = async (clientId) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
      if (!orders[clientId]) {
        try {
          const clientOrders = await getClientOrders(clientId);
          setOrders(prev => ({ ...prev, [clientId]: clientOrders }));
        } catch (error) {
          console.error("Failed to load orders:", error);
          setOrders(prev => ({ ...prev, [clientId]: [] }));
        }
      }
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {["Наименование", "Вид", "УНП", "ЕГР", "МНС", "Страна", "Средний чек", 
              "Дебиторская задолженность", "Среднее время оплаты", "Активность"].map(
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
                  <IconButton 
                    size="small" 
                    onClick={() => toggleRow(client.id)}
                    disabled={!client.unified_state_register} // Отключаем для недействующих клиентов
                  >
                    {expandedClientId === client.id ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.type}</TableCell>
                <TableCell>{client.unp}</TableCell>
                <TableCell>{client.unified_state_register ? 'Действующий' : 'Исключен из ЕГР'}</TableCell>
                <TableCell>{client.ministry_taxes_duties ? 'Действующий' : 'Ликвидирован'}</TableCell>
                <TableCell>{client.country}</TableCell>
                <TableCell>{client.avg_check.toFixed(2)}</TableCell>
                <TableCell>{client.debt.toFixed(2)}</TableCell>
                <TableCell>{client.avg_payment_time.toFixed(2)} дней</TableCell>
                <TableCell>{client.activity_status}</TableCell>
              </TableRow>
              {expandedClientId === client.id && (
                <TableRow>
                  <TableCell colSpan={11} style={{ paddingBottom: 0, paddingTop: 0 }}>
                    <Collapse in={expandedClientId === client.id} timeout="auto" unmountOnExit>
                      {orders[client.id]?.length > 0 ? (
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {["Дата обращения", "Сумма", "Оплачено", "Осталось оплатить", "Статус"].map((column) => (
                                <TableCell key={column}>{column}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {orders[client.id].map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>{new Date(order.request_date).toLocaleDateString()}</TableCell>
                                <TableCell>{order.total_amount.toFixed(2)}</TableCell>
                                <TableCell>{order.paid_amount.toFixed(2)}</TableCell>
                                <TableCell>{(order.total_amount - order.paid_amount).toFixed(2)}</TableCell>
                                <TableCell>{order.status}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div style={{ padding: '16px', textAlign: 'center' }}>
                          Нет данных о заказах
                        </div>
                      )}
                    </Collapse>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Clients;