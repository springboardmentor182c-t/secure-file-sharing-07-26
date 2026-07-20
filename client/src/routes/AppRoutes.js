import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainLayout from "../layout/MainLayout";

import Dashboard from "../pages/Dashboard/Dashboard";
import Files from "../pages/Files/Files";
import SharedFiles from "../pages/SharedFiles/SharedFiles";
import Recent from "../pages/Recent/Recent";
import Monitoring from "../pages/Monitoring/Monitoring";
import Settings from "../pages/Settings/Settings";
import Profile from "../pages/Profile/Profile";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/files" element={<Files />} />
          <Route path="/shared-files" element={<SharedFiles />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/monitoring" element={<Monitoring />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;