import React from "react";
import "./Navbar.css";
import { Search, Bell, Moon, Sun } from "lucide-react";



export default function Navbar({
    unreadCount = 0,
    darkMode,
    setDarkMode,
}) {
    return (
    <header className="navbar-modern">

      <div className="navbar-search">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search files, users, links..."
        />
        <kbd className="search-shortcut">CTRL+K</kbd>

      </div>

      <div className="navbar-actions">

   <button
    className="nav-icon-btn"
    onClick={() => setDarkMode(!darkMode)}
>
    {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
</button>

    <button className="nav-icon-btn">

        <Bell size={18}/>

        {unreadCount > 0 && (
            <span className="notif-dot">
                {unreadCount}
            </span>
        )}

    </button>

</div>
    </header>
  );
}