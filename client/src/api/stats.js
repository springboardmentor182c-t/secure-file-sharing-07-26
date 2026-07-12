import axios from "axios";

const API_URL = "http://localhost:8000/api/stats";

export const getSummary = async () => {
  const res = await axios.get(`${API_URL}/summary`);
  return res.data;
};

export const getStorageByUser = async () => {
  const res = await axios.get(`${API_URL}/storage`);
  return res.data;
};