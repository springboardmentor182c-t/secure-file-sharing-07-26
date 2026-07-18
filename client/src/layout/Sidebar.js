import React from "react";
import { NavLink } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import UploadOutlinedIcon from "@mui/icons-material/UploadOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";


const menuItems = [
    {
        name: "Dashboard",
        path: "/",
        icon: <DashboardIcon />
    },
    {
        name: "File Management",
        path: "/files",
        icon: <FolderOutlinedIcon />
    },
    {
        name: "Upload",
        path: "/upload",
        icon: <UploadOutlinedIcon />
    },
    {
        name: "Secure Sharing",
        path: "/sharing",
        icon: <ShareOutlinedIcon />
    },
    {
        name: "Encryption & Security",
        path: "/security",
        icon: <SecurityOutlinedIcon />
    },
    {
        name: "Activity Monitor",
        path: "/activity",
        icon: <MonitorHeartOutlinedIcon />
    },
    {
        name: "Notifications",
        path: "/notifications",
        icon: <NotificationsNoneOutlinedIcon />
    },
    {
        name: "Analytics",
        path: "/analytics",
        icon: <BarChartOutlinedIcon />
    },
    {
        name: "Admin",
        path: "/admin",
        icon: <AdminPanelSettingsOutlinedIcon />
    }
];


const Sidebar = () => {

    return (
        <aside className="sidebar">

            <div>

                <div className="logo-section">

                    <div className="logo-circle">
                        T
                    </div>

                    <div>
                        <h2>TrustShare</h2>
                        <p>Enterprise</p>
                    </div>

                </div>


                <div className="sidebar-menu">

                    {
                        menuItems.map((item) => (

                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    isActive ? "menu active" : "menu"
                                }
                            >

                                {item.icon}

                                <span>{item.name}</span>

                            </NavLink>

                        ))
                    }

                </div>

            </div>


            <div className="bottom-menu">

                <NavLink to="/profile" className="menu">
                    <AccountCircleOutlinedIcon />
                    <span>Profile</span>
                </NavLink>


                <NavLink to="/logout" className="menu">
                    <LogoutOutlinedIcon />
                    <span>Sign out</span>
                </NavLink>

            </div>


        </aside>
    );
};


export default Sidebar;