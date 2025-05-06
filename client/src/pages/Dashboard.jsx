import React, { useEffect, useState, useCallback } from "react";
import {
  Grid,
  Box,
  Button,
  CircularProgress,
  Typography,
  Alert,
  Popover,
  Divider,
  useTheme,
} from "@mui/material";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import 'moment/locale/ru';
import FilterIcon from '../static/images/filter.png'
import CalendarIcon from '../static/images/calendar.png';

import DashboardCard from "../components/DashboardCard";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

moment.locale('ru');

const Dashboard = () => {
  const theme = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(moment().subtract(6, 'months'));
  const [endDate, setEndDate] = useState(moment());

  const [anchorEl, setAnchorEl] = useState(null);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);

  const fetchData = useCallback(async (start, end) => {
    setLoading(true);
    setError(null);
    console.log(`Запрос данных за период: ${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`);
    try {
      const params = {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      };
      const response = await axios.get(`${API_URL}/dashboard`, { params });
      setData(response.data);
    } catch (err) {
      console.error("Ошибка при загрузке данных дашборда:", err);
      setError(err.response?.data || err.message || "Не удалось загрузить данные");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(startDate, endDate);
  }, []);

  const handleOpenDatePickerPopover = (event) => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setAnchorEl(event.currentTarget);
  };

  const handleCloseDatePickerPopover = () => {
    setAnchorEl(null);
  };

  const handleApplyDateRangeFromPopover = () => {
    if (tempStartDate && tempEndDate && !tempStartDate.isAfter(tempEndDate)) {
      setStartDate(tempStartDate);
      setEndDate(tempEndDate);
      fetchData(tempStartDate, tempEndDate);
      handleCloseDatePickerPopover();
    } else {
      console.error("Некорректный диапазон дат в Popover");
    }
  };

  const open = Boolean(anchorEl);
  const popoverId = open ? 'date-range-popover' : undefined;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
            <Typography>Ошибка при загрузке данных:</Typography>
            <Typography variant="body2">{typeof error === 'string' ? error : JSON.stringify(error)}</Typography>
             <Button onClick={() => fetchData(startDate, endDate)} size="small" sx={{ mt: 1 }}>
                 Попробовать снова
             </Button>
        </Alert>
      </Box>
    );
  }

  if (!data) {
      return <Typography sx={{ p: 3 }}>Нет данных для отображения.</Typography>;
  }

  const periodString = `${startDate.format('DD.MM.YYYY')} - ${endDate.format('DD.MM.YYYY')}`;

  return (
    <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ru">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          aria-describedby={popoverId}
          variant="outlined"
          onClick={handleOpenDatePickerPopover}
          sx={{
            borderColor: "#E0E0E0",
            borderRadius: "8px",
            px: 1.5,
            py: 0,
            bgcolor: "#fff",
            width: 'auto',
            minWidth: 'auto',
            height: "39px",
            color: '#8D8D8D',
            fontSize: "14px",
            textTransform: 'none',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            transition: "all 0.3s ease",
            '&:hover': {
              borderColor: "#BDBDBD",
              bgcolor: "#fff",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
            },
            '&:focus-visible, &.Mui-focused': {
              borderColor: "#4E7DD1",
              boxShadow: "0px 0px 0px 2px rgba(78, 125, 209, 0.2)",
            },
          }}
        >
           {/* {periodString} */}
          
            <Box
             component="img"
             src={FilterIcon}
             alt="Filter"
             sx={{
               width: 16,
               height: 16,
               objectFit: 'contain',
               opacity: 0.6,
             }}
           />
        </Button>

        <Popover
          id={popoverId}
          open={open}
          anchorEl={anchorEl}
          onClose={handleCloseDatePickerPopover}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                p: 2,
                mt: 1,
                borderRadius: 2,
                boxShadow: theme.shadows[6],
                // minWidth: '280px',
                width: '209px',
              }
            }
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2, textAlign: 'center', fontWeight: 400, fontFamily: 'Manrope', fontSize: '18px' }}>
            Выберите период
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* DatePicker для начальной даты */}
            <DatePicker
              label="Начальная дата"
              value={tempStartDate}
              onChange={(newValue) => setTempStartDate(newValue)}
              maxDate={tempEndDate || moment()}
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
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
            {/* DatePicker для конечной даты */}
            <DatePicker
              label="Конечная дата"
              value={tempEndDate}
              onChange={(newValue) => setTempEndDate(newValue)}
              minDate={tempStartDate || undefined}
              maxDate={moment()}
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
              slotProps={{ textField: { size: 'small', fullWidth: true } }}
            />
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
             <Button onClick={handleCloseDatePickerPopover} size="small" sx={{ border: 1, borderColor: "#252525", color: '#252525', borderRadius: "5px", fontFamily: 'Manrope', fontWeight: '600', fontSize: '14px' }}>
               Отмена
             </Button>
            <Button
              // variant="contained"
              onClick={handleApplyDateRangeFromPopover}
              disabled={!tempStartDate || !tempEndDate || tempStartDate.isAfter(tempEndDate)}
              size="small"
              sx={{ backgroundColor: "#252525", color: '#fff', borderRadius: "5px", fontFamily: 'Manrope', fontWeight: '600', fontSize: '14px' }}
            >
              Применить
            </Button>
          </Box>
        </Popover>
      </Box>

      <Grid container spacing={4}>
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Доля успешно закрытых заказов (%)"
                 value={data.completedOrders?.value ?? 0}
                 change={data.completedOrders?.change ?? 0}
                 data={data.completedOrders?.history ?? []}
                 period={periodString}
             />
          </Grid>
          {/* Средняя стоимость заказа */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Средняя стоимость заказа (руб)"
                 value={data.averageOrderCost?.value ?? 0}
                 change={data.averageOrderCost?.change ?? 0}
                 data={data.averageOrderCost?.history ?? []}
                 period={periodString}
             />
          </Grid>
           {/* Среднее время выполнения заказа */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Среднее время выполнения заказа (дн)"
                 value={data.averageOrderTime?.value ?? 0}
                 change={data.averageOrderTime?.change ?? 0}
                 data={data.averageOrderTime?.history ?? []}
                 period={periodString}
             />
          </Grid>
          {/* Количество клиентов (Общее) */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Общее количество клиентов"
                 value={data.totalClients?.value ?? 0}
                 change={data.totalClients?.change ?? 0}
                 data={data.totalClients?.history ?? []}
                 period="Накопительно"
             />
          </Grid>
           {/* Количество новых клиентов */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Количество новых клиентов"
                 value={data.newClients?.value ?? 0}
                 change={data.newClients?.change ?? 0}
                 data={data.newClients?.history ?? []}
                 period={`За период: ${periodString}`}
             />
          </Grid>
          {/* Общая дебиторская задолженность */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Общая дебиторская задолженность (руб)"
                 value={data.totalDebt?.value ?? 0}
                 change={data.totalDebt?.change ?? 0}
                 data={data.totalDebt?.history ?? []}
                 period="Текущий общий долг"
             />
          </Grid>
          {/* Среднее время оплаты заказов */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Среднее время оплаты заказов (дн)"
                 value={data.averagePaymentTime?.value ?? 0}
                 change={data.averagePaymentTime?.change ?? 0}
                 data={data.averagePaymentTime?.history ?? []}
                 period={periodString}
             />
          </Grid>
          {/* Объем продаж */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Объем продаж (руб)"
                 value={data.salesVolume?.value ?? 0}
                 change={data.salesVolume?.change ?? 0}
                 data={data.salesVolume?.history ?? []}
                 period={periodString}
             />
          </Grid>
           {/* Расходы на реализацию */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Расходы на реализацию (руб)"
                 value={data.implementationCosts?.value ?? 0}
                 change={data.implementationCosts?.change ?? 0}
                 data={data.implementationCosts?.history ?? []}
                 period={periodString}
             />
          </Grid>
          {/* Рентабельность продукции */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Рентабельность продукции (%)"
                 value={data.productProfitability?.value ?? 0}
                 change={data.productProfitability?.change ?? 0}
                 data={data.productProfitability?.history ?? []}
                 period={periodString}
             />
          </Grid>
          {/* Рентабельность продаж */}
          <Grid item xs={12} md={6} lg={4}>
             <DashboardCard
                 title="Рентабельность продаж (%)"
                 value={data.salesProfitability?.value ?? 0}
                 change={data.salesProfitability?.change ?? 0}
                 data={data.salesProfitability?.history ?? []}
                 period={periodString}
             />
          </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default Dashboard;