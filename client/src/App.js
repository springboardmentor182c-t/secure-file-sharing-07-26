import React from "react";
import FileManagementPage from "./filemanagement/FileManagementPage";
import "./assets/css/layout.css";
import "./assets/css/sidebar.css";
import "./assets/css/header.css";
import "./assets/css/folders.css";
import "./assets/css/table.css";
import "./assets/css/responsive.css";
function App() {
  return (
    <div className="App">
      <FileManagementPage />
    </div>
  );
}

export default App;