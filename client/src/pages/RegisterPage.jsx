import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { TextField, Button, Container, Typography, Box, Link, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Background from '../static/images/bg-img.jpg';
import Logo from '../static/images/Logo-reg-img.svg';

document.body.style.margin = "0";

const RegisterPage = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", data);
      navigate("/login");
    } catch (error) {
      alert("Ошибка регистрации: " + error.response.data.message);
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
        backgroundImage: `url(${Background})`
      }}
    >
      <Container maxWidth="sm" sx={{ backgroundColor: "white", borderRadius: "15px", py: 10, px: 4 }}>
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
          Зарегистрироваться в приложении
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <TextField
              {...register("firstName")}
              label="Имя"
              fullWidth
              required
              margin="dense"
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px" } }}
            />
            <TextField
              {...register("lastName")}
              label="Фамилия"
              fullWidth
              required
              margin="dense"
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px" } }}
            />
          </Box>
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
            type={showPassword ? "text" : "password"}
            fullWidth
            required
            margin="dense"
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px", fontFamily: 'Manrope' } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ backgroundColor: "#252525", color: "white", border: "1px solid", borderColor: "#B7B7B7", boxShadow: "none", borderRadius: '25px', mt: "20px", fontFamily: 'Manrope', fontWeight: "700", fontSize: "small" }}
          >
            Зарегистрироваться
          </Button>
        </form>
        <Typography sx={{ textAlign: "center", marginTop: 2, fontSize: 15 }}>
          Есть аккаунт?{" "}
          <Link
            href="/login"
            variant="body2"
            sx={{ alignSelf: "center" }}
            underline="none"
            color="#E1A3FF"
            fontSize={15}
          >
            Войти
          </Link>
        </Typography>
      </Container>
    </Box>
  );
};

export default RegisterPage;