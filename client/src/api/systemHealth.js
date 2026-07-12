import axios from "axios";

const API_URL = "http://localhost:8000/api/system-health";

export const getSystemHealth = async () => {
  const res = await axios.get(`${API_URL}/`);
  return res.data;
};