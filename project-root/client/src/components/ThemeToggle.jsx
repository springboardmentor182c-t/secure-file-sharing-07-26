import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        padding: "10px 15px",
        borderRadius: "20px",
        border: "none",
        cursor: "pointer",
        fontSize: "16px",
        backgroundColor: theme === "light" ? "#222" : "#fff",
        color: theme === "light" ? "#fff" : "#222",
        transition: "0.3s ease"
      }}
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
};

export default ThemeToggle;