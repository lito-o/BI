import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Container, Typography } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", data);
      navigate("/login");
    } catch (error) {
      alert("Ошибка регистрации: " + error.response.data.message);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" align="center" gutterBottom>
        Регистрация
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <TextField {...register("lastName")} label="Фамилия" fullWidth margin="normal" required />
        <TextField {...register("firstName")} label="Имя" fullWidth margin="normal" required />
        <TextField {...register("email")} label="Email" fullWidth margin="normal" required />
        <TextField {...register("password")} label="Пароль" type="password" fullWidth margin="normal" required />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Зарегистрироваться
        </Button>
      </form>
    </Container>
  );
};

export default RegisterPage;
