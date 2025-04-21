import React, { useState } from "react";
import {
  Box,
  Breadcrumbs,
  InputBase,
  Typography,
} from "@mui/material";
import { useLocation, Link as RouterLink } from "react-router-dom";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import SearchIcon from '../static/images/search.png';
import CalendarIcon from '../static/images/calendar.png';

const DashboardToolbar = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState(dayjs());
  
  // Обработка пути
  const pathSegments = location.pathname.split('/').filter(x => x);
  const isDashboardInPath = pathSegments[0] === 'dashboard';
  const breadcrumbSegments = isDashboardInPath ? pathSegments.slice(1) : pathSegments;

  const routeTranslations = {
    orders: 'Заказы',
    clients: 'Клиенты',
    deliveries: 'Поставки',
    suppliers: 'Поставщики',
    dashboard: 'Главная',
  };

  const handleSearch = () => {
    const content = document.querySelector("main");
    if (!content) return;
    const regex = new RegExp(searchQuery, "gi");
    const highlights = content.querySelectorAll(".highlight");
    highlights.forEach((el) => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
      parent.normalize();
    });
    if (!searchQuery.trim()) return;
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const matches = [...node.textContent.matchAll(regex)];
      if (matches.length) {
        const span = document.createElement("span");
        span.className = "highlight";
        span.style.backgroundColor = "red";
        const match = matches[0];
        const before = node.textContent.slice(0, match.index);
        const after = node.textContent.slice(match.index + match[0].length);
        const parent = node.parentNode;
        parent.replaceChild(document.createTextNode(after), node);
        parent.insertBefore(span, parent.firstChild);
        span.textContent = match[0];
        parent.insertBefore(document.createTextNode(before), span);
      }
    }
  };

  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        bgcolor: "#fff",
        px: 0,
        py: 1.5,
        borderRadius: 2,
      }}
    >
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{ color: "#252525", fontSize: 14 }}
        separator="›"
      >
        <RouterLink 
          to="/dashboard" 
          style={{
            textDecoration: "none",
            fontFamily: 'Manrope',
            fontWeight: '400',
            fontSize: '16px',
            color: '#565656' 
          }}
        >
          Главная
        </RouterLink>
        {breadcrumbSegments.map((value, index) => {
          const originalIndex = isDashboardInPath ? index + 1 : index;
          const to = `/${pathSegments.slice(0, originalIndex + 1).join('/')}`;
          const isLast = index === breadcrumbSegments.length - 1;
          const translatedValue = routeTranslations[value] || decodeURIComponent(value);

          return isLast ? (
            <Typography
              key={to}
              sx={{
                fontFamily: 'Manrope',
                fontWeight: '400',
                fontSize: '16px',
                color: '#252525' 
              }}
            >
              {translatedValue}
            </Typography>
          ) : (
            <RouterLink
              key={to}
              to={to}
              style={{
                textDecoration: "none",
                fontFamily: 'Manrope',
                fontWeight: '400',
                fontSize: '16px',
                color: '#252525' 
              }}
            >
              {translatedValue}
            </RouterLink>
          );
        })}
      </Breadcrumbs>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #E0E0E0",
            borderRadius: "8px",
            px: 1.5,
            py: 0.5,
            bgcolor: "#fff",
            width: 209,
            height: "39px",
            transition: "all 0.3s ease",
            "&:hover": {
              borderColor: "#BDBDBD",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
            },
            "&:focus-within": {
              borderColor: "#4E7DD1",
              boxShadow: "0px 0px 0px 2px rgba(78, 125, 209, 0.2)",
            }
          }}
        >
          <Box
            component="img"
            src={SearchIcon}
            alt="Search"
            sx={{
              width: 14,
              height: 14,
              objectFit: 'contain',
              opacity: 0.6,
              mr: "12px"
            }}
          />
          <InputBase
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            sx={{
              flex: 1,
              fontSize: "14px",
              color: "#414141",
              "&::placeholder": {
                color: "#9E9E9E",
                opacity: 1
              }
            }}
          />
        </Box>

        <DatePicker
          value={date}
          onChange={(newDate) => setDate(newDate)}
          format="DD.MM.YYYY"
          slots={{
            openPickerIcon: () => (
              <Box
                component="img"
                src={CalendarIcon}
                alt="Calendar"
                sx={{
                  width: 16,
                  height: 16,
                  objectFit: 'contain',
                  opacity: 0.6
                }}
              />
            ),
          }}
          slotProps={{
            textField: {
              size: "small",
              variant: "outlined",
              sx: {
                width: 209,
                bgcolor: "#fff",
                borderRadius: "8px",
                "& .MuiOutlinedInput-root": {
                  paddingRight: "8px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#BDBDBD",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4E7DD1",
                    boxShadow: "0px 0px 0px 2px rgba(78, 125, 209, 0.2)",
                  },
                },
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#E0E0E0",
                },
                "& .MuiInputBase-input": {
                  color: "#8D8D8D",
                  fontSize: "14px",
                  padding: "8px 12px",
                  paddingRight: "0",
                },
                "& .MuiButtonBase-root": {
                  marginRight: "4px",
                },
                "& .MuiInputBase-root": {
                  paddingRight: "0px",
                  height: "39px",
                  borderRadius: "8px",
                }
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default DashboardToolbar;