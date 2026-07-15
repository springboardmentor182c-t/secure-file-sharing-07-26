import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAnalytics } from '../context/AnalyticsContext';

export default function PageContainer({ children }) {
  const { isAuthenticated } = useAnalytics();
  const location = useLocation();
  const isFilesPage = location.pathname === '/files';

  if (isFilesPage) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar />
      
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {isAuthenticated && <Sidebar />}
        
        <main
          style={{
            flex: 1,
            padding: '40px',
            overflowY: 'auto',
            maxHeight: isAuthenticated ? 'calc(100vh - 70px)' : 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
