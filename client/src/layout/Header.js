import React, { useEffect, useRef } from "react";
import { Menu, Search, X } from "lucide-react";
import { useLocation } from "react-router-dom";
import pageTitles from "../data/pageTitles";
import NotificationBell from "../components/NotificationBell";

function Header({ setSidebarOpen, searchTerm, onSearchChange, currentUser }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "TrustShare";
  const inputRef = useRef(null);

  // Global Ctrl + K / Cmd + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header className="h-20 shrink-0 flex items-center justify-between px-6 lg:px-8 bg-[#1E1F2B] border-b border-[#34364A]">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-300 hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-white capitalize">
            {title}
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Home / {title}
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center w-72 lg:w-96 px-4 py-2.5 rounded-xl bg-[#272938] border border-[#34364A] focus-within:border-[#7C5CFC] transition-colors">
        <Search size={18} className="text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || ""}
          onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
          placeholder="Search files..."
          className="ml-3 w-full bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none"
        />
        {searchTerm ? (
          <button
            onClick={() => onSearchChange && onSearchChange("")}
            className="text-gray-400 hover:text-white p-0.5 shrink-0 cursor-pointer"
            title="Clear search"
          >
            <X size={15} />
          </button>
        ) : (
          <span className="text-[11px] text-gray-400 border border-[#34364A] rounded-md px-2 py-0.5 whitespace-nowrap shrink-0 bg-[#1E1F2B] font-mono">
            Ctrl + K
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 lg:gap-5">
        <NotificationBell />
      </div>
    </header>
  );
}

export default Header;
