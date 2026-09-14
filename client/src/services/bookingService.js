import axios from "axios";

const API_URL = "http://localhost:5000/api/bookings";

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
// CUSTOMER
// ==========================================

export const createBooking = async (bookingData) => {
  const response = await axios.post(
    API_URL,
    bookingData,
    authConfig()
  );

  return response.data;
};

export const getMyBookings = async () => {
  const response = await axios.get(
    `${API_URL}/my`,
    authConfig()
  );

  return response.data;
};

// ==========================================
// ADMIN
// ==========================================

export const getBookings = async (params = {}) => {
  const response = await axios.get(
    API_URL,
    {
      params,
      ...authConfig(),
    }
  );

  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axios.get(
    `${API_URL}/${id}`,
    authConfig()
  );

  return response.data;
};

export const updateBookingStatus = async (
  id,
  status,
  adminNote = ""
) => {
  const response = await axios.patch(
    `${API_URL}/${id}/status`,
    {
      status,
      adminNote,
    },
    authConfig()
  );

  return response.data;
};

export const deleteBooking = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    authConfig()
  );

  return response.data;
};

export default {
  createBooking,
  getMyBookings,
  getBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
};