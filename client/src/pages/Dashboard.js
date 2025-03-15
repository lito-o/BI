import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button } from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Container>
      <Typography variant="h4">Добро пожаловать в BI-систему</Typography>
      <Button variant="contained" color="secondary" onClick={handleLogout}>
        Выйти
      </Button>
    </Container>
  );
};

export default Dashboard;
