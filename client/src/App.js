import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import FileManagementPage from "./filemanagement/FileManagementPage";
import FileDetailsPage from "./filemanagement/FileDetailsPage";

import "./assets/css/layout.css";
import "./assets/css/sidebar.css";
import "./assets/css/header.css";
import "./assets/css/folders.css";
import "./assets/css/table.css";
import "./assets/css/fileDetails.css";
import "./assets/css/responsive.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FileManagementPage />} />
        <Route path="/file-details" element={<FileDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;