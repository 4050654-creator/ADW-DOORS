import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("adw_store_token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getProducts = async (params = {}) => {
  const response = await api.get(
    "/products",
    { params }
  );

  return response.data;
};

export const getProductById = async (id) => {
  const response = await api.get(
    `/products/${id}`
  );

  return response.data;
};

export const getCategories = async () => {
  const response = await api.get(
    "/categories"
  );

  return response.data;
};

export const createOrder = async (
  orderData,
  token
) => {
  const response = await api.post(
    "/orders",
    orderData,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getMyOrders = async (token) => {
  const response = await api.get(
    "/orders/my-orders",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getOrderById = async (
  id,
  token
) => {
  const response = await api.get(
    `/orders/${id}`,
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const getAllOrders = async (token) => {
  const response = await api.get(
    "/orders/admin/all",
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const updateOrderStatus = async (
  id,
  orderStatus,
  token
) => {
  const response = await api.put(
    `/orders/admin/${id}/status`,
    {
      orderStatus,
    },
    {
      headers: {
        Authorization:
          `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export default api;