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
