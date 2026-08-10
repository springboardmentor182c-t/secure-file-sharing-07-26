import { useEffect, useState } from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { getNotifications } from "../services/notificationService";

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications();
      const liveData = response?.data || [];

      const readState = JSON.parse(localStorage.getItem("trustshare_read_notifications") || "{}");
      const deletedState = JSON.parse(localStorage.getItem("trustshare_deleted_notifications") || "[]");

      const merged = liveData
        .filter((item) => !deletedState.includes(String(item.id)))
        .map((item) => ({
          ...item,
          read: readState[item.id] !== undefined ? readState[item.id] : (item.read || item.is_read || false)
        }));

      setNotifications(merged);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleSync = () => loadNotifications();
    window.addEventListener("trustshare_notifications_updated", handleSync);
    window.addEventListener("storage", handleSync);

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 15000);

    return () => {
      window.removeEventListener("trustshare_notifications_updated", handleSync);
      window.removeEventListener("storage", handleSync);
      window.clearInterval(interval);
    };
  }, []);

  const handleRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (String(n.id) === String(id) ? { ...n, read: true } : n));
      const readState = JSON.parse(localStorage.getItem("trustshare_read_notifications") || "{}");
      readState[id] = true;
      localStorage.setItem("trustshare_read_notifications", JSON.stringify(readState));
      return updated;
    });
    window.dispatchEvent(new Event("trustshare_notifications_updated"));
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const readState = JSON.parse(localStorage.getItem("trustshare_read_notifications") || "{}");
      updated.forEach((n) => { readState[n.id] = true; });
      localStorage.setItem("trustshare_read_notifications", JSON.stringify(readState));
      return updated;
    });
    window.dispatchEvent(new Event("trustshare_notifications_updated"));
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setNotifications((prev) => {
      const updated = prev.filter((n) => String(n.id) !== String(id));
      const deletedState = JSON.parse(localStorage.getItem("trustshare_deleted_notifications") || "[]");
      if (!deletedState.includes(String(id))) {
        deletedState.push(String(id));
      }
      localStorage.setItem("trustshare_deleted_notifications", JSON.stringify(deletedState));
      return updated;
    });
    window.dispatchEvent(new Event("trustshare_notifications_updated"));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
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
          cursor-pointer
        "
        aria-label="Notifications"
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
              font-bold
              flex
              items-center
              justify-center
            "
          >
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="
            absolute
            right-0
            mt-3
            w-88
            bg-[#1E1F2B]
            border
            border-[#34364A]
            rounded-2xl
            shadow-2xl
            z-50
            overflow-hidden
            animate-fade-in
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
              bg-[#171822]
            "
          >
            <div className="flex items-center gap-2">
              <p className="text-white font-semibold text-sm">Notifications</p>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#7C5CFC] hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-6 text-center text-xs text-gray-400">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">No notifications found</div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-[#34364A]/50">
              {[...notifications]
                .sort((a, b) => Number(a.read) - Number(b.read))
                .map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleRead(notification.id)}
                    className={`
                      px-4
                      py-3.5
                      cursor-pointer
                      transition-colors
                      flex
                      items-start
                      justify-between
                      gap-3
                      hover:bg-[#272938]/80
                      ${!notification.read ? "bg-[#272938]" : "opacity-75"}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-white font-bold truncate">{notification.title}</p>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{notification.message}</p>
                      {notification.time && (
                        <p className="text-[10px] text-gray-500 font-mono mt-1">{notification.time}</p>
                      )}
                    </div>

                    <button
                      onClick={(e) => handleDelete(e, notification.id)}
                      className="p-1 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded transition shrink-0 cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
