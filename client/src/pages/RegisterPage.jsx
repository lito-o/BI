import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { 
  TextField, 
  Button, 
  Container, 
  Typography, 
  Box, 
  Link, 
  InputAdornment, 
  IconButton,
  Snackbar,
  Alert
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Logo from '../static/images/Logo-reg-img.svg';

document.body.style.margin = "0";

const RegisterPage = () => {
  const { 
    register, 
    handleSubmit,
    formState: { errors }
  } = useForm({
    mode: "onBlur"
  });
  
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "error"
  });

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({...prev, open: false}));
  };

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:5000/api/auth/register", data);
      setSnackbar({
        open: true,
        message: "Регистрация прошла успешно!",
        severity: "success"
      });
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Ошибка регистрации",
        severity: "error"
      });
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
      <Container maxWidth="xs" sx={{ backgroundColor: "white", borderRadius: "15px", py: 10, px: 4, border: "1px solid #1A1A1A" }}>
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
          <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
            <TextField
              {...register("firstName", { 
                required: "Имя обязательно",
                minLength: {
                  value: 2,
                  message: "Имя должно содержать минимум 2 символа"
                }
              })}
              label="Имя"
              fullWidth
              margin="dense"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px" } }}
            />
            <TextField
              {...register("lastName", { 
                required: "Фамилия обязательна",
                minLength: {
                  value: 2,
                  message: "Фамилия должна содержать минимум 2 символа"
                }
              })}
              label="Фамилия"
              fullWidth
              margin="dense"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px" } }}
            />
          </Box>
          <TextField
            {...register("email", { 
              required: "Электронный адрес обязателен",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Некорректный email"
              }
            })}
            label="Электронный адрес"
            fullWidth
            margin="dense"
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "#B7B7B7", borderRadius: "20px" } }}
          />
          <TextField
            {...register("password", { 
              required: "Пароль обязателен",
              minLength: {
                value: 6,
                message: "Пароль должен содержать минимум 6 символов"
              }
            })}
            label="Пароль"
            type={showPassword ? "text" : "password"}
            fullWidth
            margin="dense"
            error={!!errors.password}
            helperText={errors.password?.message}
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
          Уже есть аккаунт?{" "}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RegisterPage;