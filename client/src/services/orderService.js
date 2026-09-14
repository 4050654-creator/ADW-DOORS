import axios from "axios";

const API_URL = "http://localhost:5000/api/orders";

const getToken = () => {
  return localStorage.getItem("adw_store_token");
};

const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const getMyOrders = async () => {
  const response = await axios.get(
    `${API_URL}/my-orders`,
    authConfig()
  );

  return response.data;
};

export const getOrderById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    authConfig()
  );

  return response.data;
};

export const getAllOrders = async () => {
  const response = await axios.get(
    `${API_URL}/admin/all`,
    authConfig()
  );

  return response.data;
};

export const updateOrderStatus = async (id, orderStatus) => {
  const response = await axios.put(
    `${API_URL}/admin/${id}/status`,
    { orderStatus },
    authConfig()
  );

  return response.data;
};

export default {
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};