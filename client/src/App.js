import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import PageContainer from "./layout/PageContainer";

// Pages & Features
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Securesharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import Storage from "./pages/Storage";

import Dashboard from "./features/dashboard/Dashboard";
import NotificationFeature from "./features/notifications/NotificationFeature";
import ActivityMonitorPage from "./pages/ActivityMonitorPage";
import Analytics from "./features/analytics/Analytics";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from './features/profile/Profile';

// File Management
import FileManagementPage from "./filemanagement/FileManagementPage";
import FileDetailsPage from "./filemanagement/FileDetailsPage";

// File Management CSS
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

        {/* HOME */}
        <Route
          path="/"
          element={
            <PageContainer>
              <Home />
            </PageContainer>
          }
        />

        {/* DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <PageContainer>
              <Dashboard />
            </PageContainer>
          }
        />

        {/* SECURE SHARING */}
        <Route
          path="/sharing"
          element={
            <PageContainer>
              <Securesharing />
            </PageContainer>
          }
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={
            <PageContainer>
              <Settings />
            </PageContainer>
          }
        />

        {/* UPLOAD */}
        <Route
          path="/upload"
          element={
            <PageContainer>
              <Upload />
            </PageContainer>
          }
        />

        {/* FILES */}
        <Route
          path="/files"
          element={<FileManagementPage />}
        />

        <Route
          path="/file-details"
          element={<FileDetailsPage />}
        />

        {/* USERS */}
        <Route
          path="/users"
          element={
            <PageContainer>
              <Users />
            </PageContainer>
          }
        />

        {/* ACTIVITY */}
        <Route
          path="/activity"
          element={
            <PageContainer>
              <ActivityMonitorPage />
            </PageContainer>
          }
        />

        {/* NOTIFICATIONS */}
        <Route
          path="/notifications"
          element={
            <PageContainer>
              <NotificationFeature />
            </PageContainer>
          }
        />

        {/* STORAGE */}
        <Route
          path="/storage"
          element={
            <PageContainer>
              <Storage />
            </PageContainer>
          }
        />

        {/* ANALYTICS */}
        <Route
          path="/analytics"
          element={
            <PageContainer>
              <Analytics />
            </PageContainer>
          }
        />

        {/* PROFILE */}
        <Route
         path="/profile"
         element={
           <PageContainer>
            <Profile />
           </PageContainer>
          } 
        />

        {/* ADMIN */}
        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* AUTHENTICATION */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
