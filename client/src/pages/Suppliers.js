import React, { useState, useEffect } from "react";
import { Box, Typography } from "@mui/material";
import axios from "axios";
import SuppliersTable from "../components/SuppliersTable";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/suppliers")
      .then((response) => setSuppliers(response.data))
      .catch((error) => console.error("Ошибка загрузки поставщиков:", error));
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Поставщики</Typography>
      <SuppliersTable suppliers={suppliers} />
    </Box>
  );
};

export default Suppliers;

