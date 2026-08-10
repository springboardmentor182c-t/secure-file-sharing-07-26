import React from "react";
import { FiBell } from "react-icons/fi";

const Header = () => {
  return (
    <header className="top-header">

      <h2>File Management</h2>

      <div className="top-right">


        <button className="notification-btn">
          <FiBell />
        </button>

        <div className="profile">

          <div className="avatar">
            SM
          </div>

          <div>
            <h4>Sarah Mitchell</h4>
            <p>Administrator</p>
          </div>

        </div>

      </div>

    </header>
  );
};

export default Header;