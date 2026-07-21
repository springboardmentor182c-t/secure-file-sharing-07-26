import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import SecureSharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
              <SecureSharing />
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

        <Route path="/login" element={<Login />} />

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

        <Route path="/signup" element={<Signup />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;