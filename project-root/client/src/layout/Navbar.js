import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import { Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
    RiSearch2Line,
    RiFileTextLine,
    RiFolderOpenLine,
    RiShareForwardLine,
    RiNotification3Line,
    RiImageLine,
    RiFileZipLine,
    RiCodeBoxLine,
    RiVideoLine,
    RiShieldCheckLine,
} from "react-icons/ri";
import { searchAPI, notificationsAPI } from "../utils/api";

export default function Navbar({ unreadCount = 0, setSidebarOpen, darkMode, setDarkMode }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [notifications, setNotifications] = useState([]);
    const notificationRef = useRef(null);
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

        function handleClickOutside(event) {

            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setResults(null);
            }

            if (
                notificationRef.current &&
                !notificationRef.current.contains(event.target)
            ) {
                setShowNotifications(false);
            }

        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

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

    const getNotificationIcon = (notification) => {

        const text =
            `${notification.title} ${notification.message}`.toLowerCase();

        if (text.includes("share"))
            return <RiShareForwardLine className="notification-type-icon" />;

        if (text.includes("folder"))
            return <RiFolderOpenLine className="notification-type-icon" />;

        if (text.includes("security"))
            return <RiShieldCheckLine className="notification-type-icon" />;

        if (text.includes("file"))
            return <RiFileTextLine className="notification-type-icon" />;

        return <RiNotification3Line className="notification-type-icon" />;
    };

    const getSearchFileIcon = (filename) => {

        const ext = filename.split(".").pop().toLowerCase();

        switch (ext) {

            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
            case "svg":
            case "webp":
                return <RiImageLine className="search-icon" />;

            case "mp4":
            case "avi":
            case "mov":
            case "mkv":
                return <RiVideoLine className="search-icon" />;

            case "zip":
            case "rar":
            case "7z":
                return <RiFileZipLine className="search-icon" />;

            case "js":
            case "jsx":
            case "ts":
            case "tsx":
            case "java":
            case "py":
            case "cpp":
            case "css":
            case "html":
                return <RiCodeBoxLine className="search-icon" />;

            default:
                return <RiFileTextLine className="search-icon" />;
        }
    };


    return (
        <header className="navbar-modern">
            <div
                className="navbar-search"
                ref={searchRef}
            >
                <RiSearch2Line className="search-icon" />

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
                                        <>
                                            {getSearchFileIcon(file.original_name)}
                                            <span>{file.original_name}</span>
                                        </>
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
                                        <>
                                            <RiFolderOpenLine className="search-icon" />
                                            <span>{folder.name}</span>
                                        </>
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
                                        <>
                                            <RiShareForwardLine className="search-icon" />
                                            <span>Share #{share.id}</span>
                                        </>
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
                                        <>
                                            <RiNotification3Line className="search-icon" />
                                            <span>{notification.title}</span>
                                        </>
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
            <div
                className="navbar-actions"
                ref={notificationRef}
            >
                <button className="nav-icon-btn" onClick={toggleTheme}>
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <button
                    className={`nav-icon-btn ${showNotifications ? "active" : ""}`}
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

                                    <div className="notification-icon">

                                        {getNotificationIcon(notification)}

                                    </div>

                                    <div className="notification-content">

                                        <div className="notification-title">

                                            {notification.title}

                                        </div>

                                        <div className="notification-message">

                                            {notification.message}

                                        </div>

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
