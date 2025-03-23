import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography} from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
    <Container>
      <Typography variant="h4">Главная страница BI-системы</Typography>
    </Container>
  );
};

export default Dashboard;
