import React, { useState } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Collapse, IconButton, Paper } from "@mui/material";
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";

const SuppliersTable = ({ suppliers }) => {
  const [openRows, setOpenRows] = useState({});

  const toggleRow = (id) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Наименование</TableCell>
            <TableCell>Вид поставщика</TableCell>
            <TableCell>Страна регистрации</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {suppliers.map((supplier) => (
            <React.Fragment key={supplier.id}>
              <TableRow>
                <TableCell>
                  <IconButton size="small" onClick={() => toggleRow(supplier.id)}>
                    {openRows[supplier.id] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                  </IconButton>
                </TableCell>
                <TableCell>{supplier.name}</TableCell>
                <TableCell>{supplier.type}</TableCell>
                <TableCell>{supplier.country}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4}>
                  <Collapse in={openRows[supplier.id]} timeout="auto" unmountOnExit>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Артикул</TableCell>
                          <TableCell>Наименование</TableCell>
                          <TableCell>Дата поставки</TableCell>
                          <TableCell>Количество</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {supplier.deliveries.map((delivery) => (
                          <TableRow key={delivery.id}>
                            <TableCell>{delivery.article}</TableCell>
                            <TableCell>{delivery.productName}</TableCell>
                            <TableCell>{delivery.date}</TableCell>
                            <TableCell>{delivery.quantity}</TableCell>
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

export default SuppliersTable;
