import React from "react";
import { Card, CardContent, Typography, Chip } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const DashboardCard = ({ title, value, change, data }) => {
  return (
    <Card sx={{ width: "100%", height: "100%", p: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h5" gutterBottom>
          {value}
        </Typography>
        <Chip
          label={`Изменение: ${change.toFixed(2)}%`}
          color={change > 0 ? "success" : change < 0 ? "error" : "default"}
        />
        <LineChart width={400} height={200} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
        </LineChart>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;