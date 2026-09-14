import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://adw-doors-production.up.railway.app/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adw_store_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Products
export const getProducts = async (params = {}) => {
  const response = await api.get("/products", {
    params,
  });

  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);

  return response.data;
};

// Categories
export const getCategories = async () => {
  const response = await api.get("/categories");

  return response.data;
};

// Orders
export const createOrder = async (orderData, token) => {
  const response = await api.post("/orders", orderData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await api.get("/orders/my-orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getOrderById = async (id, token) => {
  const response = await api.get(`/orders/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export default api;

