import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import MyFilesPage from "../features/myFiles/MyFilesPage";
import SharedLinksPage from "../features/sharedLinks/SharedLinksPage";
import Recent from "../pages/Recent/Recent";
import Trash from "../pages/Trash";
import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";

import { SharedFilesView } from "../pages/SharedFiles/SharedFiles";
import { SecurityView } from "../pages/security/security";
import { AuditLogsView } from "../pages/AuditLogs/AuditLogs";
import { AnalyticsView } from "../pages/Analytics/Analytics";
import Notifications from "../pages/Notifications/Notifications";
import PublicSharePage from "../pages/PublicSharePage";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/share/:id" element={<PublicSharePage />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<MyFilesPage initialView="files" />} />
          <Route path="/starred" element={<MyFilesPage initialView="starred" />} />
          <Route path="/shared-files" element={<SharedFilesView />} />
          <Route path="/shared-links" element={<SharedLinksPage />} />
          <Route path="/analytics" element={<AnalyticsView />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/security" element={<SecurityView />} />
          <Route path="/audit" element={<AuditLogsView />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;