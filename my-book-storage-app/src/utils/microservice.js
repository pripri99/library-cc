import axios from "axios";

const API_URL = "http://localhost:3001";

export const sendAddBookRequest = async (book) => {
  try {
    await axios.post(`${API_URL}/add-book-requests`, book);
  } catch (error) {
    console.error("Error sending add book request:", error);
  }
};
