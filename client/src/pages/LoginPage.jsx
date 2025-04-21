import React from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Container, Typography, Box, Link } from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from '../static/images/Logo-reg-img.svg';
document.body.style.margin = "0";

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
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        margin: 0,
        backgroundColor: "#FEFCFF"
      }}
    >
      <Container maxWidth="xs" sx={{ backgroundColor: "white", borderRadius: "15px", py: 10, border: "1px solid #1A1A1A" }}>
        <Box
        sx={{
          width: 66,
          height: 66,
          mx: "auto",
          mb: 2,
          backgroundImage: `url(${Logo})`
        }}
        />
        <Typography variant="h6" align="center" gutterBottom sx={{ color: "#2e1a5a", mb: "2rem", fontFamily: 'Manrope', fontWeight: "800", fontSize: "20px" }}>
          Добро пожаловать в Pulse
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            {...register("email")}
            label="Электронный адрес"
            fullWidth
            required
            margin="dense"
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px" } }}
          />
          <TextField
            {...register("password")}
            label="Пароль"
            type="password"
            fullWidth
            required
            margin="dense"
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px", fontFamily: 'Manrope' } }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ backgroundColor: "#252525", color: "white", border: "1px solid", borderColor: "#B7B7B7", boxShadow: "none", borderRadius: '25px', mt: "20px", fontFamily: 'Manrope', fontWeight: "700", fontSize: "small" }}
          >
            Войти
          </Button>
        </form>
        <Typography sx={{ textAlign: "center", marginTop: 2, fontSize: 15 }}>
          Не зарегистрированы?{" "}
          <Link
            href="/register"
            variant="body2"
            sx={{ alignSelf: "center" }}
            underline="none"
            color="#E1A3FF"
            fontSize={15}
          >
            Создать аккаунт
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default LoginPage;