import { useEffect, useState } from "react";
import { getNotifications } from "../services/notificationService";

function useNotifications() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function loadNotifications() {
      const data = await getNotifications();
      setNotifications(data);
    }

    loadNotifications();
  }, []);

  return notifications;
}

export default useNotifications;