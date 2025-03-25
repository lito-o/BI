import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Typography} from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
  }, [navigate]);

  return (
      <Typography variant="h4">Главная страница BI-системы</Typography>
  );
};

export default Dashboard;
