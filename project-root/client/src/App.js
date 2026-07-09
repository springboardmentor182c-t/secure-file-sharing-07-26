import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ActivityPage from "./features/activity/ActivityPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page redirects to Activity */}
        <Route
          path="/"
          element={<Navigate to="/activity" replace />}
        />

        {/* Activity Module */}
        <Route
          path="/activity"
          element={<ActivityPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;