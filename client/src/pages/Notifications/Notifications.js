import React, { useState, useEffect } from "react";
import { Bell, ShieldCheck, Share2, Info, CheckCheck, Trash2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/notifications`);
      if (res.ok) {
        const json = await res.json();
        const liveData = json.data || [];
        const readState = JSON.parse(localStorage.getItem("trustshare_read_notifications") || "{}");
        const deletedState = JSON.parse(localStorage.getItem("trustshare_deleted_notifications") || "[]");

        const merged = liveData
          .filter((item) => !deletedState.includes(String(item.id)))
          .map((item) => ({
            ...item,
            read: readState[item.id] !== undefined ? readState[item.id] : (item.read || item.is_read || false)
          }));

        setNotifications(merged);
      }
    } catch (err) {
      console.error("Failed to load live notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleSync = () => loadNotifications();
    window.addEventListener("trustshare_notifications_updated", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      window.removeEventListener("trustshare_notifications_updated", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      const readState = JSON.parse(localStorage.getItem("trustshare_read_notifications") || "{}");
      updated.forEach((n) => { readState[n.id] = true; });
      localStorage.setItem("trustshare_read_notifications", JSON.stringify(readState));
      return updated;
    });
    window.dispatchEvent(new Event("trustshare_notifications_updated"));
  };

  const markAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (String(n.id) === String(id) ? { ...n, read: true } : n));
      const readState = JSON.parse(localStorage.getItem("trustshare_read_notifications") || "{}");
      readState[id] = true;
      localStorage.setItem("trustshare_read_notifications", JSON.stringify(readState));
      return updated;
    });
    window.dispatchEvent(new Event("trustshare_notifications_updated"));
  };

  const deleteNotification = (id) => {
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

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "security") return n.type === "security";
    if (filter === "sharing") return n.type === "sharing";
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2D2F3F] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#7C5CFC]/20 text-[#9E86FF] border border-[#7C5CFC]/30">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Real-time platform alerts, security events, and share link updates.</p>
        </div>

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="px-3.5 py-2 rounded-xl bg-[#272938] hover:bg-[#34364A] text-gray-300 text-xs font-semibold border border-[#34364A] transition flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCheck className="w-4 h-4 text-purple-400" /> Mark All as Read
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#2D2F3F] pb-3 text-xs">
        {[
          { id: "all", label: "All Notifications" },
          { id: "unread", label: `Unread (${unreadCount})` },
          { id: "sharing", label: "Sharing Events" },
          { id: "security", label: "Security & System" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
              filter === tab.id
                ? "bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/20"
                : "text-gray-400 hover:text-white hover:bg-[#272938]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="bg-[#1E1F2B] border border-[#2D2F3F] rounded-2xl p-12 text-center text-gray-400 text-xs">
            Loading live notifications...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#1E1F2B] border border-[#2D2F3F] rounded-2xl p-12 text-center text-gray-400 space-y-3">
            <Bell className="w-10 h-10 mx-auto text-gray-600" />
            <p className="text-sm font-semibold text-white">No notifications found</p>
            <p className="text-xs text-gray-500">You are all caught up!</p>
          </div>
        ) : (
          filtered.map(item => {
            const Icon = item.icon || (item.iconName === "ShieldCheck" ? ShieldCheck : item.iconName === "Info" ? Info : Share2);
            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                  item.read
                    ? "bg-[#1E1F2B]/50 border-[#2D2F3F]/60 opacity-80"
                    : "bg-[#1E1F2B] border-[#7C5CFC]/40 shadow-lg shadow-[#7C5CFC]/5"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl border ${item.color || "text-purple-400 bg-purple-500/10 border-purple-500/20"} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-[#7C5CFC] inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{item.message}</p>
                    <span className="text-[10px] text-gray-500 mt-2 inline-block font-mono">{item.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.read && (
                    <button
                      onClick={() => markAsRead(item.id)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#272938] rounded-lg transition text-xs flex items-center gap-1 cursor-pointer"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#272938] rounded-lg transition text-xs cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}