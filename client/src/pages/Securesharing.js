import React, { useState } from 'react';

function SecureSharing() {
  // 1. Form Inputs ke liye State variables
  const [selectedFile, setSelectedFile] = useState('');
  const [accessLevel, setAccessLevel] = useState('View Only');
  const [expiry, setExpiry] = useState('7 days');
  const [maxDownloads, setMaxDownloads] = useState(10);
  
  // Extra Added Security Features (Jo humne discuss kiye the)
  const [passwordProtect, setPasswordProtect] = useState(false);
  const [password, setPassword] = useState('');

  // 2. Mock Data: Right panel mein links list dikhane ke liye temporary array
  const [activeLinks, setActiveLinks] = useState([
    { id: 1, file: 'Q3-Financial-Report.pdf', url: 'https://vault.sh/s/Xk9m3P', status: 'Active', date: 'Today' },
    { id: 2, file: 'Product-Roadmap-2025.pptx', url: 'https://vault.sh/s/R7nQ2V', status: 'Active', date: 'Yesterday' },
    { id: 3, file: 'brand-guidelines-v2.pdf', url: 'https://vault.sh/s/T5pL8W', status: 'Expired', date: 'Jun 28' }
  ]);

  // 3. Link generation function (Abhi ke liye alert dikhayega)
  const handleGenerateLink = (e) => {
    e.preventDefault();
    alert(`Link generation trigger hua: \nFile: ${selectedFile} \nAccess: ${accessLevel} \nPassword Protected: ${passwordProtect ? 'Yes' : 'No'}`);
  };

  return (
    <div style={{ padding: '24px', backgroundColor: '#FAF9F6', minHeight: '100vh' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#334155' }}>Secure Sharing</h2>
      
      {/* Do Parts ka Main Layout Container */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        
        {/* ================= LEFT PANEL ================= */}
        <div style={{ flex: '1', minWidth: '320px', backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Create Share Link</h3>
          
          <form onSubmit={handleGenerateLink}>
            {/* File Dropdown */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Select File</label>
              <select 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={selectedFile} 
                onChange={(e) => setSelectedFile(e.target.value)}
                required
              >
                <option value="">-- Choose a file --</option>
                <option value="Q3-Financial-Report.pdf">Q3-Financial-Report.pdf</option>
                <option value="Product-Roadmap-2025.pptx">Product-Roadmap-2025.pptx</option>
              </select>
            </div>

            {/* Access Level Grid Buttons */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Access Level</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {['View Only', 'Download', 'Comment', 'Edit'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setAccessLevel(level)}
                    style={{
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      cursor: 'pointer',
                      fontWeight: '500',
                      backgroundColor: accessLevel === level ? '#5A4A42' : '#fff',
                      color: accessLevel === level ? '#fff' : '#475569'
                    }}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Expiry */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Expiry</label>
              <select 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              >
                <option value="1 day">1 day</option>
                <option value="7 days">7 days</option>
                <option value="30 days">30 days</option>
              </select>
            </div>

            {/* Max Downloads */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '6px', fontWeight: '500' }}>Max Downloads</label>
              <input 
                type="number" 
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                value={maxDownloads}
                onChange={(e) => setMaxDownloads(e.target.value)}
                min="1"
              />
            </div>

            {/* Security Extra Features: Password Protected checkbox */}
            <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input 
                type="checkbox" 
                id="pwdProtect" 
                checked={passwordProtect}
                onChange={(e) => setPasswordProtect(e.target.checked)}
              />
              <label htmlFor="pwdProtect" style={{ fontSize: '14px', cursor: 'pointer' }}>Protect link with password</label>
            </div>

            {passwordProtect && (
              <div style={{ marginBottom: '16px' }}>
                <input 
                  type="password" 
                  placeholder="Set custom password" 
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Submit */}
            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: '#5A4A42', color: '#fff', fontWeight: '600', cursor: 'pointer', marginTop: '10px' }}
            >
              🔗 Generate Link
            </button>
          </form>
        </div>

        {/* ================= RIGHT PANEL ================= */}
        <div style={{ flex: '1.5', minWidth: '350px', backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Active Share Links</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeLinks.map((link) => (
              <div key={link.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                <div>
                  <h4 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' }}>{link.file}</h4>
                  <p style={{ fontSize: '12px', color: '#2563eb', fontFamily: 'monospace', margin: '0 0 4px 0' }}>{link.url}</p>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>{link.date}</span>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    fontSize: '12px',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontWeight: '500',
                    backgroundColor: link.status === 'Active' ? '#dcfce7' : '#fee2e2',
                    color: link.status === 'Active' ? '#15803d' : '#b91c1c'
                  }}>
                    {link.status}
                  </span>
                  <button style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default SecureSharing;