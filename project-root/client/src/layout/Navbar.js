import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { Search, Bell, Moon, Sun } from "lucide-react";
import { searchAPI, notificationsAPI } from "../utils/api";

export default function Navbar({ unreadCount = 0, darkMode, setDarkMode }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (!query.trim()) {
            setResults(null);
            setLoading(false);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setLoading(true);

                const res = await searchAPI.search(query);

                console.log("Search Results:", res.data);

                setResults(res.data);
            } catch (err) {
                console.error(err);

                setResults(null);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query]);

    const handleResultClick = (type, item) => {
        setQuery("");

        setResults(null);

        switch (type) {
            case "file":
                navigate("/files");

                break;

            case "folder":
                navigate("/files");

                break;

            case "share":
                navigate("/sharing");

                break;

            case "notification":
                navigate("/notifications");

                break;

            default:
                navigate("/dashboard");
        }
    };

    useEffect(() => {

        if (!showNotifications) return;

        const loadNotifications = async () => {

            try {

                const res = await notificationsAPI.list();

                setNotifications(res.data.slice(0, 5));

            } catch (err) {

                console.error(err);

            }

        };

        loadNotifications();

    }, [showNotifications]);

    return (
        <header className="navbar-modern">
            <div className="navbar-search">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search files, folders..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setResults(null);
                    }}
                />

                {loading && (
                    <div className="search-dropdown">
                        <div className="search-item">Searching...</div>
                    </div>
                )}

                {!loading && results && (
                    <div className="search-dropdown">
                        {results.files?.length > 0 && (
                            <div className="search-section">
                                <div className="search-title">Files</div>

                                {results.files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="search-item"
                                        onClick={() => handleResultClick("file", file)}
                                    >
                                        📄 {file.original_name}
                                    </div>
                                ))}
                            </div>
                        )}

                        {results.folders?.length > 0 && (
                            <div className="search-section">
                                <div className="search-title">Folders</div>

                                {results.folders.map((folder) => (
                                    <div
                                        key={folder.id}
                                        className="search-item"
                                        onClick={() => handleResultClick("folder", folder)}
                                    >
                                        📁 {folder.name}
                                    </div>
                                ))}
                            </div>
                        )}

                        {results.shares?.length > 0 && (
                            <div className="search-section">
                                <div className="search-title">Shares</div>

                                {results.shares.map((share) => (
                                    <div
                                        key={share.id}
                                        className="search-item"
                                        onClick={() => handleResultClick("share", share)}
                                    >
                                        🔗 Share #{share.id}
                                    </div>
                                ))}
                            </div>
                        )}

                        {results.notifications?.length > 0 && (
                            <div className="search-section">
                                <div className="search-title">Notifications</div>

                                {results.notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="search-item"
                                        onClick={() =>
                                            handleResultClick("notification", notification)
                                        }
                                    >
                                        🔔 {notification.title}
                                    </div>
                                ))}
                            </div>
                        )}

                        {results &&
                            results.files?.length === 0 &&
                            results.folders?.length === 0 &&
                            results.shares?.length === 0 &&
                            results.notifications?.length === 0 && (
                                <div className="search-item">No matching results found.</div>
                            )}
                    </div>
                )}
                <kbd className="search-shortcut">CTRL+K</kbd>
            </div>

            <div className="navbar-actions">
                <button className="nav-icon-btn" onClick={() => setDarkMode(!darkMode)}>
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                    className="nav-icon-btn"
                    onClick={() => setShowNotifications(!showNotifications)}
                >
                    <Bell size={18} />

                    {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
                </button>

                {showNotifications && (

                    <div className="notification-dropdown">

                        <div className="notification-header">

                            Notifications

                        </div>

                        {notifications.length === 0 ? (

                            <div className="notification-empty">

                                No notifications

                            </div>

                        ) : (

                            notifications.map(notification => (

                                <div
                                    key={notification.id}
                                    className="notification-item"
                                    onClick={() => {

                                        setShowNotifications(false);

                                        navigate("/notifications");

                                    }}
                                >

                                    <div className="notification-title">

                                        {notification.title}

                                    </div>

                                    <div className="notification-message">

                                        {notification.message}

                                    </div>

                                </div>

                            ))

                        )}

                        <button
                            className="notification-view-all"
                            onClick={() => {

                                setShowNotifications(false);

                                navigate("/notifications");

                            }}
                        >

                            View All

                        </button>

                    </div>

                )}
            </div>
        </header>
    );
}
