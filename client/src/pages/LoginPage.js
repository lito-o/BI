import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Container, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", data);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (error) {
      alert("Ошибка входа: " + error.response.data.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" align="center" gutterBottom>
        Вход
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField {...register("email")} label="Email" fullWidth margin="normal" required />
        <TextField {...register("password")} label="Пароль" type="password" fullWidth margin="normal" required />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Войти
        </Button>
      </form>
    </Container>
  );
};

export default LoginPage;
