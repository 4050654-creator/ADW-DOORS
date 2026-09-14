import axios from "axios";

// ========================================
// API URL
// ========================================

const API_URL =
  "http://localhost:5000/api/payments";

// ========================================
// Token
// ========================================

const getToken = () => {
  return localStorage.getItem(
    "adw_store_token"
  );
};

// ========================================
// Auth Config
// ========================================

const authConfig = () => {
  const token = getToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type":
        "application/json",
    },
  };
};

// ========================================
// Create Payment
// ========================================

export const createPayment = async (
  paymentData
) => {
  const response =
    await axios.post(
      API_URL,
      paymentData,
      authConfig()
    );

  return response.data;
};

// ========================================
// Get My Payments
// ========================================

export const getMyPayments =
  async () => {
    const response =
      await axios.get(
        `${API_URL}/my`,
        authConfig()
      );

    return response.data;
  };

// ========================================
// Get Payment By ID
// ========================================

export const getPaymentById =
  async (id) => {
    const response =
      await axios.get(
        `${API_URL}/${id}`,
        authConfig()
      );

    return response.data;
  };

// ========================================
// Admin - Get Payments
// ========================================

export const getPayments =
  async (params = {}) => {
    const response =
      await axios.get(
        API_URL,
        {
          params,
          ...authConfig(),
        }
      );

    return response.data;
  };

// ========================================
// Admin - Update Payment Status
// ========================================

export const updatePaymentStatus =
  async (
    id,
    status,
    extraData = {}
  ) => {
    const response =
      await axios.patch(
        `${API_URL}/${id}/status`,
        {
          status,
          ...extraData,
        },
        authConfig()
      );

    return response.data;
  };

// ========================================
// Default Export
// ========================================

export default {
  createPayment,
  getMyPayments,
  getPaymentById,
  getPayments,
  updatePaymentStatus,
};