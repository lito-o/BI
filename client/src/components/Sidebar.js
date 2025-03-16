import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { Home, ShoppingCart, People, Inventory, Business, ExitToApp } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ open }) => {
  const navigate = useNavigate();

  const menuItems = [
    { text: "Главная", icon: <Home />, path: "/dashboard" },
    { text: "Заказы", icon: <ShoppingCart />, path: "/orders" },
    { text: "Клиенты", icon: <People />, path: "/clients" },
    { text: "Закупки", icon: <Inventory />, path: "/purchases" },
    { text: "Поставщики", icon: <Business />, path: "/suppliers" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Drawer variant="permanent" open={open}>
      <List>
        {menuItems.map((item, index) => (
          <ListItem button key={index} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
        <ListItem button onClick={handleLogout}>
          <ListItemIcon><ExitToApp /></ListItemIcon>
          <ListItemText primary="Выход" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;
