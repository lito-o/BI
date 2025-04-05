import React from "react";
import { Box, CssBaseline, Container } from "@mui/material";
import Sidebar from "../components/Sidebar";
import DashboardToolbar from "../components/Toolbar";

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
  <Container maxWidth="xl">
    <DashboardToolbar />
    {children}
  </Container>
</Box>
    </Box>
  );
};

export default DashboardLayout;
