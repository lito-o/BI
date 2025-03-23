import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Clients from "./pages/Clients";
import Deliveries from "./pages/Deliveries";
import Suppliers from "./pages/Suppliers";
import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
        <Route path="/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
        <Route path="/clients" element={<DashboardLayout><Clients /></DashboardLayout>} />
        <Route path="/deliveries" element={<DashboardLayout><Deliveries /></DashboardLayout>} />
        <Route path="/suppliers" element={<DashboardLayout><Suppliers /></DashboardLayout>} />
      </Routes>
    </Router>
  );
}

export default App;

