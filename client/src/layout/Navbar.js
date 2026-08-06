import React from "react";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const Navbar = ({title}) => {
  return (
    <div className="navbar">
      <h2 className="navbar-title">{title}</h2>


      <div className="navbar-right">
        <div className="search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search files, users..."
          />
        </div>

        <div className="notification">
          <NotificationsNoneIcon />
          <span>3</span>
        </div>

        <div className="profile">
          <div className="avatar">
            SM
          </div>

          <div className="profile-info">
            <h4>Sarah Mitchell</h4>
            <p>Administrator</p>
          </div>

          <KeyboardArrowDownIcon />
        </div>
      </div>

    </div>
  );
};

export default Navbar;