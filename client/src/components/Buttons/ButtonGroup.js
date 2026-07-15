import React from 'react';

export default function ButtonGroup({ children, align = 'left' }) {
  const justifyValue = align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start';

  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: justifyValue, alignItems: 'center', flexWrap: 'wrap', width: '100%', marginTop: '10px' }}>
      {children}
    </div>
  );
}
