import React from "react";
import { Button } from "@mui/material";

const Buttons = ({ exportToExcel, handleImportExcel }) => (
  <div>
    <Button
      component="label"
      onClick={exportToExcel}
      variant="outlined"
      sx={{ width: "120px", mt: "18px", mb: "10px", borderColor: "#565656", borderWidth: 2, color: "#252525", borderRadius: "5px", fontFamily: 'Manrope', fontWeight: '600', fontSize: '14px' }}
    >
      Экспорт
    </Button>
    <Button
      component="label"
      variant="contained"
      sx={{ width: "120px", mt: "18px", mb: "10px", ml: "10px", backgroundColor: "#252525", fontFamily: 'Manrope', fontWeight: '600', fontSize: '14px' }}
    >
      Импорт
      <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
    </Button>
  </div>
);

export default Buttons;
