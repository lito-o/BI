import React from "react";
import { Button } from "@mui/material";

const Buttons = ({ exportToExcel, handleImportExcel }) => (
  <div>
    <Button
      component="label"
      onClick={exportToExcel}
      variant="contained"
      sx={{ width: "90px", mt: "18px", mb: "10px", backgroundColor: "#252525" }}
    >
      Экспорт
    </Button>
    <Button
      component="label"
      variant="contained"
      sx={{ width: "90px", mt: "18px", mb: "10px", ml: 2, backgroundColor: "#252525" }}
    >
      Импорт
      <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
    </Button>
  </div>
);

export default Buttons;
