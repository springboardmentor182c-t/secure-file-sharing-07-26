import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../assets/global.css";

const PageContainer = ({ children }) => {
  return (
    <div className="layout">
      <Sidebar />

      <div className="mainSection">
        <Navbar />

        <div className="pageContainer">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;