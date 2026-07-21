import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
/**
 * Navbar – top navigation bar used across the app.
 * Uses localStorage for user name and provides logout and theme toggle.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };
  const toggleTheme = () => {
    document.body.classList.toggle('dark');
  };
  const userName = localStorage.getItem('user_name') || 'User';
  return (
    <nav className="bg-white dark:bg-gray-800 shadow px-4 py-2 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Link to="/" className="text-xl font-bold text-gray-800 dark:text-white">SecureShare</Link>
        <Link to="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Dashboard</Link>
        <Link to="/files" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Files</Link>
        <Link to="/analytics" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Analytics</Link>
        <Link to="/admin" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600">Admin</Link>
      </div>
      <div className="flex items-center space-x-3">
        <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-indigo-600">🌓</button>
        <span className="text-gray-700 dark:text-gray-200">{userName}</span>
        <button onClick={handleLogout} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-500">Logout</button>
      </div>
    </nav>
  );
}

