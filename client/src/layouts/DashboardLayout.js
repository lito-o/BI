import React from "react";
import { Box, CssBaseline } from "@mui/material";
import Sidebar from "../components/Sidebar";

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
