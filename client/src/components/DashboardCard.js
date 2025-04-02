import React from "react";
import { Card, CardContent, Typography, Chip, Stack, Box } from "@mui/material";
import { LineChart, Line, Tooltip, ResponsiveContainer } from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box sx={{ 
        bgcolor: 'background.paper', 
        p: 1, 
        borderRadius: 1,
        boxShadow: 2,
        border: '1px solid #e0e0e0'
      }}>
        <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
          {data.value}
        </Typography>
        {/* <Typography variant="caption" color="text.secondary">
          {data.date}
        </Typography> */}
      </Box>
    );
  }
  return null;
};

const DashboardCard = ({ title, value, change, period, data }) => {
  return (
    <Card sx={{ 
      width: "100%", 
      height: "100%", 
      p: 3,
      borderRadius: 2,
      boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)"
    }}>
      <CardContent sx={{ p: 0 }}>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          gutterBottom
          sx={{ fontWeight: 500 }}
        >
          {title}
        </Typography>
        
        <Stack direction="row" alignItems="flex-end" spacing={1} mb={2}>
          <Typography 
            variant="h4" 
            sx={{ fontWeight: 700 }}
          >
            {value.toFixed(2)}
          </Typography>
          <Chip
            label={`${change.toFixed(2)}%`}
            color="success"
            size="small"
            sx={{ 
              borderRadius: 1,
              backgroundColor: "#e6f7ee",
              color: "#00a76f",
              fontWeight: 600
            }}
          />
        </Stack>
        
        <Box sx={{ width: '100%', height: 80, mt: 2, mb: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00a76f" 
                strokeWidth={2}
                dot={false}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: '#e0e0e0', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
        
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ display: "block" }}
        >
          {period}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;