import axios from "axios";

const API_URL = "http://localhost:5000/api"; // Адрес сервера

export const getSuppliers = async () => {
  try {
    const response = await axios.get(`${API_URL}/suppliers`);
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки поставщиков:", error);
    return [];
  }
};

export const getDeliveries = async () => {
    try {
      const response = await axios.get(`${API_URL}/deliveries`);
      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки поставок:", error);
      return [];
    }
  };
  
  export const getClients = async () => {
    try {
      const response = await axios.get(`${API_URL}/clients`);
      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки клиентов:", error);
      return [];
    }
  };
  
  export const getClientOrders = async (clientId) => {
    try {
      const response = await axios.get(`${API_URL}/clients/${clientId}/orders`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка загрузки заказов клиента ${clientId}:`, error);
      return [];
    }
  };
  
  export const getOrders = async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`);
      return response.data;
    } catch (error) {
      console.error("Ошибка загрузки заказов:", error);
      return [];
    }
  };

  // export const getDashboard = async () => {
  //   try {
  //     const response = await axios.get(`${API_URL}/dashboard`);
  //     return response.data;
  //   } catch (error) {
  //     console.error("Ошибка загрузки статистики:", error);
  //     return [];
  //   }
  // };
  