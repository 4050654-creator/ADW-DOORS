import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://adw-doors-production.up.railway.app/api";

const BOOKINGS_URL = `${API_URL}/bookings`;

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
    BOOKINGS_URL,
    bookingData,
    authConfig()
  );

  return response.data;
};

export const getMyBookings = async () => {
  const response = await axios.get(
    `${BOOKINGS_URL}/my`,
    authConfig()
  );

  return response.data;
};

// ==========================================
// ADMIN
// ==========================================

export const getBookings = async (params = {}) => {
  const response = await axios.get(
    BOOKINGS_URL,
    {
      params,
      ...authConfig(),
    }
  );

  return response.data;
};

export const getBookingById = async (id) => {
  const response = await axios.get(
    `${BOOKINGS_URL}/${id}`,
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
    `${BOOKINGS_URL}/${id}/status`,
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
    `${BOOKINGS_URL}/${id}`,
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

