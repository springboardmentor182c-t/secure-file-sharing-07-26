import ActivityMonitorPage from "./pages/ActivityMonitorPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import SecureSharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./features/dashboard/Dashboard";
function App() {
  return (
    <>
      <div className="App">
        <h1>Secure File Sharing - Client</h1>
      </div>

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

          <Route path="/signup" element={<Signup />} />

          <Route
            path="/activity"
            element={
              <PageContainer>
                <ActivityMonitorPage />
              </PageContainer>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}



export default App;