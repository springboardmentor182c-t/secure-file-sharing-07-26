import { useEffect, useState } from "react";
import { getNotifications } from "../services/notificationService";

function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const data = await getNotifications();

        console.log("Notifications:", data);

        setNotifications(data);

      } catch (error) {
        console.error("Notification Error:", error);
      }
    }

    loadNotifications();
  }, []);

  return notifications;
}

export default useNotifications;