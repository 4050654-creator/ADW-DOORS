import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://adw-doors-production.up.railway.app/api";

const PAYMENTS_URL = `${API_URL}/payments`;

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

// ==========================================
// Create Payment
// ==========================================

export const createPayment = async (paymentData) => {
  const response = await axios.post(
    PAYMENTS_URL,
    paymentData,
    authConfig()
  );

  return response.data;
};

// ==========================================
// Get My Payments
// ==========================================

export const getMyPayments = async () => {
  const response = await axios.get(
    `${PAYMENTS_URL}/my`,
    authConfig()
  );

  return response.data;
};

// ==========================================
// Get Payment By ID
// ==========================================

export const getPaymentById = async (id) => {
  const response = await axios.get(
    `${PAYMENTS_URL}/${id}`,
    authConfig()
  );

  return response.data;
};

// ==========================================
// Admin - Get Payments
// ==========================================

export const getPayments = async (params = {}) => {
  const response = await axios.get(
    PAYMENTS_URL,
    {
      params,
      ...authConfig(),
    }
  );

  return response.data;
};

// ==========================================
// Admin - Update Payment Status
// ==========================================

export const updatePaymentStatus = async (
  id,
  status,
  extraData = {}
) => {
  const response = await axios.patch(
    `${PAYMENTS_URL}/${id}/status`,
    {
      status,
      ...extraData,
    },
    authConfig()
  );

  return response.data;
};

export default {
  createPayment,
  getMyPayments,
  getPaymentById,
  getPayments,
  updatePaymentStatus,
};

