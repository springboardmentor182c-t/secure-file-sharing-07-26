import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

import {
  getNotifications,
  markNotificationRead,
} from "../services/notificationService";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      const response = await getNotifications();

      setNotifications(response.data || []);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                is_read: true,
              }
            : notification,
        ),
      );
    } catch (error) {
      console.error("Failed to mark notification", error);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  return (
    <div className="relative">
      {/* Bell Button */}

      <button
        onClick={() => setOpen(!open)}
        className="
          relative
          h-11
          w-11
          rounded-xl
          bg-[#272938]
          border
          border-[#34364A]
          flex
          items-center
          justify-center
          hover:bg-[#34364A]
          transition
        "
      >
        <Bell size={20} className="text-gray-300" />

        {unreadCount > 0 && (
          <span
            className="
                absolute
                -top-1
                -right-1
                h-5
                min-w-5
                px-1
                rounded-full
                bg-red-500
                text-white
                text-xs
                flex
                items-center
                justify-center
              "
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}

      {open && (
        <div
          className="
              absolute
              right-0
              mt-3
              w-80
              bg-[#1E1F2B]
              border
              border-[#34364A]
              rounded-xl
              shadow-xl
              z-50
              overflow-hidden
            "
        >
          <div
            className="
              px-4
              py-3
              border-b
              border-[#34364A]
              flex
              items-center
              justify-between
              "
          >
            <p
              className="
                text-white
                font-semibold
                text-sm"
            >
              Notifications
            </p>

            {unreadCount > 0 && (
              <button
                onClick={async () => {
                  const unread = notifications.filter(
                    (notification) => !notification.is_read,
                  );

                  for (const notification of unread) {
                    await handleRead(notification.id);
                  }
                }}
                className="
        text-xs
        text-[#7C5CFC]
        hover:text-white
      "
              >
                Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div
              className="
                    p-5
                    text-center
                    text-gray-400
                  "
            >
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div
              className="
                    p-5
                    text-center
                    text-gray-400
                  "
            >
              No new notifications
            </div>
          ) : (
            [...notifications]
              .sort((a, b) => a.is_read - b.is_read)
              .map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleRead(notification.id)}
                  className={`
                      px-4
                      py-3
                      cursor-pointer
                      border-b
                      border-[#34364A]
                      hover:bg-[#272938]
                      ${!notification.is_read ? "bg-[#272938]" : ""}
                    `}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className="
                          text-sm
                        text-white
                          font-medium
                          "
                    >
                      {notification.title}
                    </p>

                    {!notification.is_read && (
                      <span
                        className="
                              h-2
                              w-2
                              rounded-full
                            bg-red-500
                              "
                      ></span>
                    )}
                  </div>

                  <p
                    className="
                        text-xs
                        text-gray-400
                        mt-1
                      "
                  >
                    {notification.message}
                  </p>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
