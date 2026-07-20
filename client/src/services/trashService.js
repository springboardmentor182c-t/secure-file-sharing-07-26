import axios from "axios";


// Backend API URL
const API_URL = `${import.meta.env.VITE_API_URL}/trash`;


// Axios instance
const trashAPI = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});


// Attach JWT token automatically
trashAPI.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);



/**
 * Get all files in trash
 */
export const getTrashFiles = async () => {

    try {

        const response = await trashAPI.get("/files");

        return response.data;

    } catch (error) {

        console.error(
            "Failed to fetch trash files:",
            error.response?.data || error.message
        );

        throw error;
    }
};




/**
 * Restore deleted file
 */
export const restoreTrashFile = async (fileId) => {

    try {

        const response = await trashAPI.put(
            `/files/${fileId}/restore`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Restore failed:",
            error.response?.data || error.message
        );

        throw error;
    }
};




/**
 * Permanently delete file
 */
export const deleteTrashFile = async (fileId) => {

    try {

        const response = await trashAPI.delete(
            `/files/${fileId}`
        );

        return response.data;

    } catch (error) {

        console.error(
            "Delete failed:",
            error.response?.data || error.message
        );

        throw error;
    }
};




/**
 * Empty complete trash
 */
export const emptyTrash = async () => {

    try {

        const response = await trashAPI.delete("");

        return response.data;

    } catch (error) {

        console.error(
            "Empty trash failed:",
            error.response?.data || error.message
        );

        throw error;
    }
};



export default trashAPI;