import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import DashboardPage from './pages/Dashboard.jsx';
import MyFilesPage from './pages/MyFiles.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate replace to="/dashboard" />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-files" element={<MyFilesPage />} />
          <Route path="*" element={<Navigate replace to="/dashboard" />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
