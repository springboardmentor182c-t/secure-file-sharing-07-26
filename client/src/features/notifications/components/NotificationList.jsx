import React, { useState } from "react";
import useNotifications from "../hooks/useNotifications";

function NotificationList() {
  const notifications = useNotifications();

  const [readNotifications, setReadNotifications] = useState([]);

  function markAsRead(id) {
    setReadNotifications([...readNotifications, id]);
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const isRead = readNotifications.includes(notification.id);

        return (
          <div
            key={notification.id}
            onClick={() => markAsRead(notification.id)}
            className="bg-white rounded-xl shadow-md p-5 border border-gray-200 cursor-pointer"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {notification.icon}
                </span>

                <h3 className="text-lg font-semibold text-gray-800">
                  {notification.title}
                </h3>
              </div>

              <span className="text-sm text-gray-500">
                {notification.time}
              </span>
            </div>

            <p className="text-gray-600 mt-2">
              {notification.message}
            </p>

            <div className="flex gap-3 items-center mt-3">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  notification.color === "red"
                    ? "bg-red-100 text-red-700"
                    : notification.color === "blue"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {notification.type}
              </span>

              {!isRead ? (
                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                  New
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-sm">
                  Read
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default NotificationList;