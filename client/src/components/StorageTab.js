import React, { useEffect, useState } from "react";
import axios from "axios";
import "./StorageTab.css";

const StorageTab = () => {
  const [storage, setStorage] = useState({
    total_storage: "",
    used_storage: "",
    percentage: 0,
    users: [],
  });

  const [fileTypes, setFileTypes] = useState([]);

  useEffect(() => {
    loadStorage();
    loadFileTypes();
  }, []);

  const loadStorage = async () => {
    try {
      const res = await axios.get("http://localhost:8000/admin/storage");
      setStorage(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadFileTypes = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/admin/storage/file-types"
      );
      setFileTypes(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="storage-grid">

      {/* Left Card */}
      <div className="storage-card">

        <h2>Organization Storage</h2>

        <div className="storage-info">
          <span>
            {storage.used_storage} of {storage.total_storage} used
          </span>

          <span>{storage.percentage}%</span>
        </div>

        <div className="main-progress">
          <div
            className="main-progress-fill"
            style={{ width: `${storage.percentage}%` }}
          ></div>
        </div>

        {storage.users.map((user, index) => (
          <div className="storage-user" key={index}>

            <div className="avatar">
              {user.name.substring(0, 2).toUpperCase()}
            </div>

            <div className="user-details">

              <div className="user-row">
                <span>{user.name}</span>
                <span>{user.storage_used}</span>
              </div>

              <div className="mini-progress">
                <div
                  className="mini-fill"
                  style={{ width: "70%" }}
                ></div>
              </div>

            </div>

          </div>
        ))}
      </div>
      {/* Right Card */}
      <div className="storage-card">

        <h2>Storage by File Type</h2>

        <div className="donut"></div>

        <div className="legend">

          {fileTypes.map((item, index) => (
            <div className="legend-item" key={index}>

              <span className={`dot d${index + 1}`}></span>

              <span className="label">
                {item.type}
              </span>

              <span className="value">
                {item.percentage}%
              </span>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
};

export default StorageTab;