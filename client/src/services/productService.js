import axios from "axios";

const API_URL = "http://localhost:5000/api/products";
const CATEGORY_API_URL = "http://localhost:5000/api/categories";

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

// ===============================
// PRODUCTS
// ===============================

export const getProducts = async (params = {}) => {
  const response = await axios.get(API_URL, {
    params,
  });

  return response.data;
};

export const getAdminProducts = async (params = {}) => {
  const response = await axios.get(API_URL, {
    params: {
      ...params,
      admin: "true",
    },
    ...authConfig(),
  });

  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);

  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(
    API_URL,
    productData,
    authConfig()
  );

  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    productData,
    authConfig()
  );

  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    authConfig()
  );

  return response.data;
};

// ===============================
// CATEGORIES
// ===============================

export const getCategories = async (admin = false) => {
  const response = await axios.get(CATEGORY_API_URL, {
    params: admin ? { admin: "true" } : {},
    ...authConfig(),
  });

  return response.data;
};

export default {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
};