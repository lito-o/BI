import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const getOrders = async () => {
  try {
    const response = await axios.get(`${API_URL}/orders`);
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки заказов:", error);
    throw error;
  }
};

export const createOrder = async (orderData) => {
  try {
    const response = await axios.post(`${API_URL}/orders`, orderData);
    return response.data;
  } catch (error) {
    console.error("Ошибка создания заказа:", error);
    throw error;
  }
};

export const updateOrder = async (id, orderData) => {
  try {
    const response = await axios.put(`${API_URL}/orders/${id}`, orderData);
    return response.data;
  } catch (error) {
    console.error("Ошибка обновления заказа:", error);
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error("Ошибка удаления заказа:", error);
    throw error;
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


export const createClients = async (clientsData) => {
  try {
    const response = await axios.post(`${API_URL}/clients`, {
      clients: clientsData,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка создания клиентов:", error);
    throw error;
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

export const createDeliveries = async (deliveriesData) => {
  try {
    const response = await axios.post(`${API_URL}/deliveries`, {
      deliveries: deliveriesData,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка создания поставок:", error);
    throw error;
  }
};

export const createDelivery = async (deliveryData) => {
  try {
    const response = await axios.post(`${API_URL}/deliveries`, deliveryData);
    return response.data;
  } catch (error) {
    console.error("Ошибка создания поставки:", error);
    throw error;
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const response = await axios.post(`${API_URL}/suppliers`, supplierData);
    return response.data;
  } catch (error) {
    console.error("Ошибка создания поставщиков:", error);
    throw error;
  }
};

export const createSuppliers = async (suppliersData) => {
  try {
    const response = await axios.post(`${API_URL}/suppliers`, {
      suppliers: suppliersData,
    });
    return response.data;
  } catch (error) {
    console.error("Ошибка создания поставщиков:", error);
    throw error;
  }
};

export const getSuppliers = async () => {
  try {
    const response = await axios.get(`${API_URL}/suppliers`);
    return response.data;
  } catch (error) {
    console.error("Ошибка загрузки поставщиков:", error);
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
  