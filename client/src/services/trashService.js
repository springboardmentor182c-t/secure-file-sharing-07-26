import { createApiRequest } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const { request } = createApiRequest(API_URL);

export const getTrashFiles = async () => {
  try {
    const response = await request("/files/trash");
    return response?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch trash files:", error.message);
    throw error;
  }
};

export const restoreTrashFile = async (fileId) => {
  try {
    const response = await request(`/files/${fileId}/restore`, { method: "POST" });
    return response?.data ?? null;
  } catch (error) {
    console.error("Restore failed:", error.message);
    throw error;
  }
};

export const deleteTrashFile = async (fileId) => {
  try {
    const response = await request(`/files/${fileId}/permanent`, { method: "DELETE" });
    return response?.data ?? null;
  } catch (error) {
    console.error("Delete failed:", error.message);
    throw error;
  }
};

export const emptyTrash = async () => {
  try {
    const files = await getTrashFiles();
    for (const file of files) {
      await deleteTrashFile(file.id);
    }
    return files;
  } catch (error) {
    console.error("Empty trash failed:", error.message);
    throw error;
  }
};
