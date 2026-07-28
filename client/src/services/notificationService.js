import axios from "axios";

const API = import.meta.env.VITE_API_URL;


const authHeader = () => ({
  headers: {
    "X-User-Id": localStorage.getItem("userId"),
  },
});


// Get notifications
export const getNotifications = async () => {

  const response = await axios.get(
    `${API}/notifications`,
    authHeader()
  );

  return response.data;

};


// Mark notification as read
export const markNotificationRead = async (id) => {

  const response = await axios.post(
    `${API}/notifications/${id}/read`,
    {},
    authHeader()
  );

  return response.data;

};