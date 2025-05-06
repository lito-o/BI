import React from "react";
import { Card, CardContent, Typography, Chip, Stack, Box } from "@mui/material";
import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  // active - флаг, показывающий активность тултипа
  // payload - массив данных точки, над которой находится курсор
  // label - значение оси X
  if (active && payload && payload.length) {
    const dataPoint = payload[0];
    return (
      <Box sx={{
        bgcolor: 'background.paper',
        p: 1,
        borderRadius: 1,
        boxShadow: 3,
        border: '1px solid #e0e0e0',
      }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="subtitle2" color="#252525" fontWeight={600}>
          {`Значение: ${parseFloat(dataPoint.value).toFixed(2)}`}
        </Typography>
      </Box>
    );
  }
  return null;
};

const DashboardCard = ({ title, value, change, data, period }) => {
  const chipColor = change > 0 ? "success" : change < 0 ? "error" : "default";
  const chipBgColor = change > 0 ? '#c9f29b' : change < 0 ? '#F98989' : '#e8ecf1';
  const chipTextColor = change > 0 ? '#0E6B14' : change < 0 ? '#8A120E' : '#5A4166';
  const chartLineColor = change > 0 ? '#A1C27C' : change < 0 ? '#F98989' : '#B6B6B6';

  // Проверка на валидность данных для графика
  const isDataValid = Array.isArray(data) && data.length > 0 && data.every(item => typeof item.value === 'number');

  return (
    <Card sx={{
      width: "100%",
      height: "100%",
      p: 2,
      borderRadius: 2,
      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
      display: 'flex',
      flexDirection: 'column',
    }}>
      <CardContent sx={{
        p: 0,
        '&:last-child': { paddingBottom: 0 },
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      {/* Заголовок карточки */}
        <Typography
          variant="subtitle1"
          color="text.secondary"
          gutterBottom
          sx={{ fontWeight: 500, mb: 1 }}
        >
          {title}
        </Typography>

        {/* Основное значение и чип с изменением */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, lineHeight: 1.2 }}
            component="span"
          >
            {Number.isInteger(value) ? value : value.toFixed(2)}
          </Typography>
          {/* Чип с процентом изменения */}
          <Chip
            // label={`${change > 0 ? '+' : ''}${change.toFixed(1)}%`} // Показываем знак и 1 знак после запятой
            label={`${change.toFixed(1)}%`}
            color={chipColor}
            size="small"
            sx={{
              borderRadius: 1,
              fontWeight: 600,
              backgroundColor: chipBgColor,
              color: chipTextColor,
            }}
          />
        </Stack>

        {/* Контейнер для графика */}
        <Box sx={{ width: '100%', height: "100px", flexGrow: 1, mb: 1 }}>
          {isDataValid ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                  data={data}
                  margin={{ top: 5, right: 10, left: -25, bottom: 0 }}
              >
                {/* Сетка для наглядности */}
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                {/* Ось X (месяцы) */}
                <XAxis dataKey="month" hide />
                {/* Ось Y */}
                <YAxis axisLine={false} tickLine={false} width={30} />
                 {/* Тултип при наведении */}
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#B6B6B6', strokeWidth: 1, strokeDasharray: '3 3' }}/>
                {/* Линия графика */}
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartLineColor}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 1, fill: '#B6B6B6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <Typography variant="caption" color="text.secondary">Нет данных для графика</Typography>
              </Box>
          )}
        </Box>

        {period && (
             <Typography
                 variant="caption"
                 color="text.secondary"
                 sx={{ display: "block", mt: 'auto' }}
             >
                 {period}
             </Typography>
         )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;