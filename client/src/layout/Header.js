import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Bell } from "lucide-react";
import { BASE_URL } from "../constants/api";
import "./Header.css";

export default function Header({
  search,
  setSearch,
  setShowShareModal,
}) {
  const [admin, setAdmin] = useState({
    name: "",
    role: "",
  });

  useEffect(() => {
    loadAdmin();
  }, []);

  const loadAdmin = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/admin/users`);

      if (res.data.length > 0) {
        setAdmin({
          name: res.data[0].name,
          role: res.data[0].role,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="dashboard-header">
      <h2 className="page-title">Admin Panel</h2>

      <div className="header-right">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search files, users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="icon-btn">
          <Bell size={18} />
        </button>

        <div className="profile">
          <div className="avatar">
            {admin.name
              ? admin.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
              : ""}
          </div>

          <div>
            <h4>{admin.name}</h4>
            <span>{admin.role}</span>
          </div>
        </div>

        <button
          className="share-btn"
          onClick={() => setShowShareModal(true)}
        >
          Share
        </button>
      </div>
    </div>
  );
}