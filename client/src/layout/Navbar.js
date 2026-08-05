import React, { useEffect, useState } from "react";
import axios from "axios";

import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const Navbar = () => {

    const [user, setUser] = useState({
        username: "",
        role: ""
    });

    useEffect(() => {

        const fetchUser = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/auth/me`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUser(response.data);

            }
            catch (error) {

                console.log(error);

            }

        };

        fetchUser();

    }, []);

    return (

        <div className="navbar">

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

                        {user.username
                            ? user.username.substring(0, 2).toUpperCase()
                            : "SM"}

                    </div>

                    <div className="profile-info">

                        <h4>
                            {user.username || "Sarah Mitchell"}
                        </h4>

                        <p>
                            {user.role || "Administrator"}
                        </p>

                    </div>

                    <KeyboardArrowDownIcon />

                </div>

            </div>

        </div>

    );

};

export default Navbar;