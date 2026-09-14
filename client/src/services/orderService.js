import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://adw-doors-production.up.railway.app/api";

const ORDERS_URL = `${API_URL}/orders`;

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

// ========================================
// Get logged-in user's orders
// ========================================

export const getMyOrders = async () => {
  const response = await axios.get(
    `${ORDERS_URL}/my-orders`,
    authConfig()
  );

  return response.data;
};

// ========================================
// Get single order
// ========================================

export const getOrderById = async (id) => {
  const response = await axios.get(
    `${ORDERS_URL}/${id}`,
    authConfig()
  );

  return response.data;
};

// ========================================
// Admin: get all orders
// ========================================

export const getAllOrders = async () => {
  const response = await axios.get(
    `${ORDERS_URL}/admin/all`,
    authConfig()
  );

  return response.data;
};

// ========================================
// Admin: update order status
// ========================================

export const updateOrderStatus = async (
  id,
  orderStatus
) => {
  const response = await axios.put(
    `${ORDERS_URL}/admin/${id}/status`,
    {
      orderStatus,
    },
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

