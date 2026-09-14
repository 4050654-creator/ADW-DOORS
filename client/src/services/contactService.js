import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://adw-doors-production.up.railway.app/api";

const CONTACT_URL = `${API_URL}/contact`;

export const sendContactMessage = async (contactData) => {
  const response = await axios.post(
    CONTACT_URL,
    contactData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};

export default {
  sendContactMessage,
};

