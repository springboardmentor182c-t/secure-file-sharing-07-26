import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/trash`;

const trashAPI = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

trashAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const getTrashFiles = async () => {
  try {
    const response = await trashAPI.get("/files");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch trash files:", error.response?.data || error.message);
    throw error;
  }
};

export const restoreTrashFile = async (fileId) => {
  try {
    const response = await trashAPI.put(`/files/${fileId}/restore`);
    return response.data;
  } catch (error) {
    console.error("Restore failed:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteTrashFile = async (fileId) => {
  try {
    const response = await trashAPI.delete(`/files/${fileId}`);
    return response.data;
  } catch (error) {
    console.error("Delete failed:", error.response?.data || error.message);
    throw error;
  }
};

export const emptyTrash = async () => {
  try {
    const response = await trashAPI.delete("");
    return response.data;
  } catch (error) {
    console.error("Empty trash failed:", error.response?.data || error.message);
    throw error;
  }
};

export default trashAPI;
