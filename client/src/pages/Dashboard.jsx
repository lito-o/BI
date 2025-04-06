import React, { useEffect, useState } from "react";
import { Grid } from "@mui/material";
import DashboardCard from "../components/DashboardCard";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

const Dashboard = () => {
  const [data, setData] = useState({
    completedOrders: { value: 0, change: 0, history: [] },
    averageOrderCost: { value: 0, change: 0, history: [] },
    averageOrderTime: { value: 0, change: 0, history: [] },
    totalClients: { value: 0, change: 0, history: [] },
    newClients: { value: 0, change: 0, history: [] },
    totalDebt: { value: 0, change: 0, history: [] },
    averagePaymentTime: { value: 0, change: 0, history: [] },
    conversionRate: { value: 0, change: 0, history: [] },
    salesVolume: { value: 0, change: 0, history: [] },
    productProfitability: { value: 0, change: 0, history: [] },
    salesProfitability: { value: 0, change: 0, history: [] },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/dashboard`);
        setData(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Grid container spacing={4}>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Доля успешно закрытых заказов (%)"
          value={data.completedOrders.value}
          change={data.completedOrders.change}
          data={data.completedOrders.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Средняя стоимость заказа (руб)"
          value={data.averageOrderCost.value}
          change={data.averageOrderCost.change}
          data={data.averageOrderCost.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Среднее время выполнения заказа (дн)"
          value={data.averageOrderTime.value}
          change={data.averageOrderTime.change}
          data={data.averageOrderTime.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Количество клиентов"
          value={data.totalClients.value}
          change={data.totalClients.change}
          data={data.totalClients.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Количество новых клиентов"
          value={data.newClients.value}
          change={data.newClients.change}
          data={data.newClients.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Общая дебиторская задолженность (руб)"
          value={data.totalDebt.value}
          change={data.totalDebt.change}
          data={data.totalDebt.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Среднее время оплаты заказов (дн)"
          value={data.averagePaymentTime.value}
          change={data.averagePaymentTime.change}
          data={data.averagePaymentTime.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Конверсия лидов в продажи (%)"
          value={data.conversionRate.value}
          change={data.conversionRate.change}
          data={data.conversionRate.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Объем продаж (руб)"
          value={data.salesVolume.value}
          change={data.salesVolume.change}
          data={data.salesVolume.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Рентабельность продукции (%)"
          value={data.productProfitability.value}
          change={data.productProfitability.change}
          data={data.productProfitability.history}
        />
      </Grid>
      <Grid item xs={12} md={6} lg={4}>
        <DashboardCard
          title="Рентабельность продаж (%)"
          value={data.salesProfitability.value}
          change={data.salesProfitability.change}
          data={data.salesProfitability.history}
        />
      </Grid>
    </Grid>
  );
};

export default Dashboard;