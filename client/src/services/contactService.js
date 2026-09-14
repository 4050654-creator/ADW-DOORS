import axios from "axios";

const API_URL =
  "http://localhost:5000/api/contact";

export const sendContactMessage =
  async (contactData) => {
    const response =
      await axios.post(
        API_URL,
        contactData,
        {
          headers: {
            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

export default {
  sendContactMessage,
};