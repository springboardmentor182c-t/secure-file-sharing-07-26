import { BrowserRouter, Routes, Route } from "react-router-dom";
import PageContainer from "./layout/PageContainer";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import SecureSharing from "./pages/Securesharing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Upload from "./pages/Upload";
import Files from "./pages/Files";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import Storage from "./pages/Storage";

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