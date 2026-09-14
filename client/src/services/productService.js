import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://adw-doors-production.up.railway.app/api";

const PRODUCTS_URL = `${API_URL}/products`;
const CATEGORY_API_URL = `${API_URL}/categories`;

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
  const response = await axios.get(PRODUCTS_URL, {
    params,
  });

  return response.data;
};

export const getAdminProducts = async (params = {}) => {
  const response = await axios.get(PRODUCTS_URL, {
    params: {
      ...params,
      admin: "true",
    },
    ...authConfig(),
  });

  return response.data;
};

export const getProductById = async (id) => {
  const response = await axios.get(
    `${PRODUCTS_URL}/${id}`
  );

  return response.data;
};

export const createProduct = async (productData) => {
  const response = await axios.post(
    PRODUCTS_URL,
    productData,
    authConfig()
  );

  return response.data;
};

export const updateProduct = async (
  id,
  productData
) => {
  const response = await axios.put(
    `${PRODUCTS_URL}/${id}`,
    productData,
    authConfig()
  );

  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await axios.delete(
    `${PRODUCTS_URL}/${id}`,
    authConfig()
  );

  return response.data;
};

// ===============================
// CATEGORIES
// ===============================

export const getCategories = async (admin = false) => {
  const response = await axios.get(
    CATEGORY_API_URL,
    {
      params: admin
        ? { admin: "true" }
        : {},
      ...authConfig(),
    }
  );

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

