import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export const sendJob = async (job, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/jobs`, job, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getJobStatus = async (jobId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getJobResult = async (jobId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}/result`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
