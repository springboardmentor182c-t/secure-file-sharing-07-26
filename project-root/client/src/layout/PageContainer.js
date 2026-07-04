import React from 'react';

/**
 * PageContainer — wraps main page content with consistent padding and max-width
 */
const PageContainer = ({ children, maxWidth = '1100px' }) => {
  return (
    <main
      style={{
        flex: 1,
        padding: '32px 24px',
        maxWidth,
        width: '100%',
        margin: '0 auto',
        minHeight: 'calc(100vh - 60px)',
      }}
    >
      {children}
    </main>
  );
};

export default PageContainer;
