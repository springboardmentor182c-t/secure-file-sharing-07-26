import { useState } from 'react';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/Dashboard';
import MyFilesPage from './pages/MyFiles';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const user = {
    name: 'Abhishek',
    email: 'abhishek@trustshare.io',
    securityBadge: 'Secure workspace active',
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0F1729] lg:flex-row">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} user={user} />
      <div className="flex-1 min-w-0">
        {currentPage === 'dashboard' ? <DashboardPage /> : <MyFilesPage />}
      </div>
    </div>
  );
}

