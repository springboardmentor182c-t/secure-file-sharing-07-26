import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";

// Pages
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

// Features
import Dashboard from "./features/dashboard/Dashboard";
import NotificationFeature from "./features/notifications/NotificationFeature";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <PageContainer>
              <Home />
            </PageContainer>
          }
        />

        <Route
          path="/sharing"
          element={
            <PageContainer>
              <Securesharing />
            </PageContainer>
          }
        />

        <Route
          path="/settings"
          element={
            <PageContainer>
              <Settings />
            </PageContainer>
          }
        />

        <Route
          path="/upload"
          element={
            <PageContainer>
              <Upload />
            </PageContainer>
          }
        />

        <Route
          path="/files"
          element={
            <PageContainer>
              <Files />
            </PageContainer>
          }
        />

        <Route
          path="/users"
          element={
            <PageContainer>
              <Users />
            </PageContainer>
          }
        />

        <Route
          path="/activity"
          element={
            <PageContainer>
              <Activity />
            </PageContainer>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PageContainer>
              <Dashboard />
            </PageContainer>
          }
        />

        <Route
          path="/notifications"
          element={
            <PageContainer>
              <NotificationFeature />
            </PageContainer>
          }
        />

        <Route
          path="/storage"
          element={
            <PageContainer>
              <Storage />
            </PageContainer>
          }
        />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;