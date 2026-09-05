import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "../assets/global.css";

const PageContainer = ({ children ,title}) => {
  return (
    <div className="layout">
      <Sidebar />

      <div className="mainSection">
        <Navbar title={title} />

        <div className="pageContainer">
          {children}
        </div>
      </div>
    </div>
  );
};

export default PageContainer;