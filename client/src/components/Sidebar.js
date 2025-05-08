import React, { useState, useEffect } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Box
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import Main from '../static/images/home.png';
import Order from '../static/images/orders.png';
import Client from '../static/images/сustomers.png';
import Delivery from '../static/images/warehouse.png';
import Supplier from '../static/images/employees.png';
import Sidebar_img from '../static/images/sidebar.png';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState({
    name: "",
    email: ""
  });
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setUser({
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email
      });
    } else {
      navigate("/login");
    }
  }, [navigate]);
  
  const menuItems = [
    { text: "Главная", icon: Main, path: "/dashboard" },
    { text: "Заказы", icon: Order, path: "/orders" },
    { text: "Клиенты", icon: Client, path: "/clients" },
    { text: "Поставки", icon: Delivery, path: "/deliveries" },
    { text: "Поставщики", icon: Supplier, path: "/suppliers" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
    handleMenuClose();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleSidebar = () => {
    setOpen(!open);
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 72,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: open ? 240 : 72,
          boxSizing: "border-box",
          transition: "width 0.3s ease",
        },
      }}
      open={open}
    >
      <Box sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 2,
        minHeight: 64
      }}>
        {open && <Typography variant="h6">Pulse</Typography>}
        <IconButton onClick={toggleSidebar}>
          <Box
            component="img"
            src={Sidebar_img}
            alt="Toggle sidebar"
            sx={{
              width: 20,
              height: 20,
              transform: open ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
          />
        </IconButton>
      </Box>
      <List sx={{ my: "auto", px: "15px" }}>
        {open && (
          <Typography sx={{
            color: "#565656",
            fontFamily: 'Manrope',
            fontWeight: "500",
            fontSize: "16px",
            mb: "10px",
            // pl: "16px"
          }}>
            Главное меню
          </Typography>
        )}
       
        {menuItems.map((item, index) => (
          <ListItem
            button
            key={index}
            onClick={() => navigate(item.path)}
            sx={{
              backgroundColor: location.pathname === item.path
                ? 'rgba(0, 0, 0, 0.08)'
                : 'transparent',
              "&:hover": {
                backgroundColor: '#EAEAEA'
              },
              py: open ? "2px" : "8px",
              borderRadius: "5px",
              px: open ? "16px" : "10px",
            }}
          >
            <ListItemIcon sx={{ minWidth: "40px" }}>
              <Box
                component="img"
                src={item.icon}
                alt={item.text}
                sx={{
                  width: 20,
                  height: 20,
                  objectFit: 'contain',
                }}
              />
            </ListItemIcon>
            {open && (
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  sx: {
                    fontFamily: 'Manrope',
                    fontWeight: '500',
                    fontSize: '16px',
                    color: '#252525'
                  }
                }}
              />
            )}
          </ListItem>
        ))}
      </List>
      <Box sx={{
        p: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: open ? "space-between" : "center"
      }}>
        {open && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar sx={{ mr: 1 }}>{user.name.charAt(0)}</Avatar>
            <Box>
              <Typography variant="subtitle2">{user.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
        <IconButton onClick={handleMenuOpen}>
          <MoreVert />
        </IconButton>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        slotProps={{
          paper: {
            style: {
              maxHeight: 200,
              width: '140px',
            },
          },
        }}
      >
        <MenuItem onClick={handleLogout} sx={{ mx: "2px", py: "0px" }}>Выход</MenuItem>
      </Menu>
    </Drawer>
  );
};

export default Sidebar;
