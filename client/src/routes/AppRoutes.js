import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import MyFilesPage from "../features/myFiles/MyFilesPage";
import SharedFiles from "../pages/SharedFiles/SharedFiles";
import SharedLinksPage from "../features/sharedLinks/SharedLinksPage";
import Monitoring from "../pages/Monitoring/Monitoring";
import Analytics from "../pages/Analytics/Analytics";
import Notifications from "../pages/Notifications/Notifications";
import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<MyFilesPage initialView="files" />} />
          <Route path="/recent" element={<MyFilesPage initialView="recent" />} />
          <Route path="/starred" element={<MyFilesPage initialView="starred" />} />
          <Route path="/trash" element={<MyFilesPage initialView="trash" />} />
          <Route path="/shared-files" element={<SharedFiles />} />
          <Route path="/shared-links" element={<SharedLinksPage />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/security" element={<Monitoring />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/audit" element={<Monitoring />} />
          <Route path="/admin" element={<Dashboard />} />
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