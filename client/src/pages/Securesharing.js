import React, { useState } from 'react';
import './Securesharing.css';
import { 
  Link2, Copy, Eye, Download, Calendar, X, DownloadCloud, 
  Edit, MessageSquare, ShieldAlert, Check, Users, Lock, 
  Fingerprint, Flame, BellRing, UserCog 
} from 'lucide-react';

const SecureSharing = () => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('Share Links');
  const [copySuccess, setCopySuccess] = useState('');
  const [manageModal, setManageModal] = useState({ isOpen: false, linkId: null, filename: '' });

  // Form State
  const [formData, setFormData] = useState({
    selectedFile: 'Q3-Financial-Report.pdf',
    accessLevel: 'View Only',
    expiry: '7 days',
    maxDownloads: 10,
    usePassword: false,
    password: '',
    allowedEmails: '', // Supports emails and @groups
    applyWatermark: false, 
    notifyMe: false, 
    oneTimeView: false 
  });

  // Mock Active Links Data 
  const [activeLinks, setActiveLinks] = useState([
    {
      id: 1,
      filename: 'Q3-Financial-Report.pdf',
      url: 'https://vault.sh/s/Xk9m3P',
      access: 'View Only',
      expiryDate: 'Jul 13, 2026',
      downloads: '3/10',
      status: 'Active'
    },
    {
      id: 2,
      filename: 'brand-guidelines-v2.pdf',
      url: 'https://vault.sh/s/T5pL8W',
      access: 'Edit',
      expiryDate: 'Expired',
      downloads: '10/10',
      status: 'Expired'
    }
  ]);

  // Mock ACL Data for the Modal (Who has access to the selected link)
  const [aclUsers, setAclUsers] = useState([
    { id: 'u1', name: 'Diksh (You)', type: 'owner', role: 'Owner' },
    { id: 'u2', name: '@Finance_Team', type: 'group', role: 'Edit' },
    { id: 'u3', name: 'client@company.com', type: 'user', role: 'View Only' }
  ]);

  // --- HANDLERS ---
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const setAccessLevel = (level) => {
    setFormData(prev => ({ ...prev, accessLevel: level }));
  };
  

  const handleGenerateLink = async (e) => {
    // Prevent the default form submission behavior
    e.preventDefault(); 
    
    try {
      // Send form data to the FastAPI backend endpoint
      const response = await fetch("http://localhost:8000/api/sharing/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      // Check if the backend successfully created the link
      if (response.ok && result.status === "success") {
        
        // Display a success alert with the generated URL
        alert(`Success! Your Share Link is: ${result.data.url}`);
        
        // Optional: Update the Active Links list in the UI
        const newActiveLink = {
          id: result.data.share_token,
          fileName: formData.selectedFile,
          url: result.data.url,
          views: 0,
          status: 'Active',
          expiry: formData.expiry
        };
        
        // setActiveLinks([newActiveLink, ...activeLinks]); // Uncomment if using state for table
        
      } else {
        // Display backend error message
        alert("Error generating link: " + (result.detail || "Unknown error occurred."));
      }
      
    } catch (error) {
      // Log and display network or connection errors
      console.error("Backend connection error:", error);
      alert("Unable to connect to the backend server. Please ensure the FastAPI server is running.");
    }
  };

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    setCopySuccess(url);
    setTimeout(() => setCopySuccess(''), 2000);
  };

  const handleRevokeLink = (id) => {
    if(window.confirm("Are you sure you want to revoke this entire link?")) {
      setActiveLinks(links => links.filter(link => link.id !== id));
    }
  };

  const handleRemoveUser = (userId) => {
    setAclUsers(users => users.filter(u => u.id !== userId));
  };

  return (
    <div className="sharing-container relative">
      
      {/* ACL MANAGE ACCESS MODAL */}
      {manageModal.isOpen && (
        <div className="modal-overlay" onClick={() => setManageModal({ isOpen: false, linkId: null, filename: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-[#EFEAE6] pb-3">
              <div>
                <h3 className="font-bold text-[#232323] text-lg">Manage Access</h3>
                <p className="text-xs text-[#8A8178] mt-1">{manageModal.filename}</p>
              </div>
              <button onClick={() => setManageModal({ isOpen: false })} className="text-[#8A8178] hover:text-[#232323]">
                <X size={20} />
              </button>
            </div>

            <div className="acl-user-list">
              {aclUsers.map(user => (
                <div key={user.id} className="acl-user-item">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${user.type === 'group' ? 'bg-blue-100 text-blue-600' : 'bg-[#EFEAE6] text-[#685D54]'}`}>
                      {user.type === 'group' ? <Users size={14}/> : user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#232323]">{user.name}</p>
                      <p className="text-xs text-[#8A8178] capitalize">{user.type}</p>
                    </div>
                  </div>
                  
                  {user.type === 'owner' ? (
                    <span className="text-xs font-semibold text-[#8A8178] px-3">Owner</span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <select className="acl-role-select" defaultValue={user.role}>
                        <option value="View Only">View Only</option>
                        <option value="Download">Download</option>
                        <option value="Comment">Comment</option>
                        <option value="Edit">Edit</option>
                      </select>
                      <button onClick={() => handleRemoveUser(user.id)} className="text-red-400 hover:text-red-600 p-1" aria-label="Remove Access">
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#EFEAE6]">
              <button className="btn-secondary" onClick={() => setManageModal({ isOpen: false })}>Cancel</button>
              <button className="btn-small-primary" onClick={() => setManageModal({ isOpen: false })}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#232323]">Secure Sharing</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: Create Share Link */}
        <div className="card-panel lg:col-span-1">
          <h2 className="text-lg font-bold text-[#232323] mb-5">Create Share Link</h2>
          
          <form className="flex flex-col gap-6" onSubmit={handleGenerateLink}>
            
            {/* File Selection */}
            <div>
              <label htmlFor="selectedFile" className="block text-sm font-medium text-[#232323] mb-1.5">File to Share</label>
              <select id="selectedFile" name="selectedFile" value={formData.selectedFile} onChange={handleInputChange} className="custom-input bg-white cursor-pointer">
                <option>Q3-Financial-Report.pdf</option>
                <option>Product-Roadmap-2026.pptx</option>
              </select>
            </div>

            {/* Access Level */}
            <div>
              <label className="block text-sm font-medium text-[#232323] mb-1.5">Default Permissions</label>
              <div className="grid grid-cols-2 gap-3">
                {['View Only', 'Download', 'Comment', 'Edit'].map((level) => (
                  <button key={level} type="button" className={`access-btn ${formData.accessLevel === level ? 'selected' : ''}`} onClick={() => setAccessLevel(level)}>
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Smart ACL Input (Users & Groups) */}
            <div>
              <label htmlFor="allowedEmails" className="block text-sm font-medium text-[#232323] mb-1.5 flex items-center gap-1.5">
                <Users size={16} className="text-[#8A8178]" /> Share with Users or Groups
              </label>
              <input 
                type="text" id="allowedEmails" name="allowedEmails"
                value={formData.allowedEmails} onChange={handleInputChange}
                className="custom-input" 
                placeholder="e.g. client@acme.com, @Finance_Team" 
              />
              <p className="text-xs text-[#8A8178] mt-1.5">Use '@' to assign roles to specific groups.</p>
            </div>

            {/* Expiry & Downloads */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiry" className="block text-sm font-medium text-[#232323] mb-1.5">Link Expiry</label>
                <select id="expiry" name="expiry" value={formData.expiry} onChange={handleInputChange} className="custom-input bg-white cursor-pointer">
                  <option>24 hours</option>
                  <option>7 days</option>
                  <option>30 days</option>
                </select>
              </div>
              <div>
                <label htmlFor="maxDownloads" className="block text-sm font-medium text-[#232323] mb-1.5">View Limit</label>
                <input type="number" id="maxDownloads" name="maxDownloads" value={formData.maxDownloads} onChange={handleInputChange} className="custom-input" min="1" disabled={formData.oneTimeView} />
              </div>
            </div>

            {/* SECURITY TOGGLES */}
            <div className="security-group flex flex-col gap-5">
              <h3 className="text-sm font-semibold text-[#232323] flex items-center gap-2 mb-1">
                <ShieldAlert size={16} /> Advanced Security
              </h3>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-[#8A8178]" />
                  <p className="text-sm font-medium text-[#232323]">Password Protection</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="usePassword" checked={formData.usePassword} onChange={handleInputChange} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
              
              {formData.usePassword && (
                <div className="animate-fade-in mb-2 ml-6">
                  <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="Set a secure password" className="custom-input py-1.5 text-sm" required />
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fingerprint size={16} className="text-[#8A8178]" />
                  <div>
                    <p className="text-sm font-medium text-[#232323]">Dynamic Watermarking</p>
                    <p className="text-xs text-[#8A8178]">Imprint viewer's info on document</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="applyWatermark" checked={formData.applyWatermark} onChange={handleInputChange} />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={16} className={formData.oneTimeView ? "text-red-500" : "text-[#8A8178]"} />
                  <div>
                    <p className={`text-sm font-medium ${formData.oneTimeView ? "text-red-600" : "text-[#232323]"}`}>Self-Destructing Link</p>
                    <p className="text-xs text-[#8A8178]">Link expires after 1 view</p>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" name="oneTimeView" checked={formData.oneTimeView} onChange={handleInputChange} />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" className="btn-primary py-3">
                <Link2 size={18} /> Generate Secure Link
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="card-panel lg:col-span-2">
          
          <div className="tabs-header">
            {['Share Links', 'Access Levels', 'Share History'].map((tab) => (
              <button key={tab} className={`tab-btn ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: Share Links */}
          {activeTab === 'Share Links' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#232323]">Active Share Links</h3>
                <span className="text-xs bg-[#F8F6F4] px-3 py-1 rounded-full text-[#685D54]">{activeLinks.length} active</span>
              </div>

              {activeLinks.map(link => (
                <div className="link-card" key={link.id}>
                  <div>
                    <h4 className="font-semibold text-[#232323]">{link.filename}</h4>
                    <div className="flex items-center gap-2 text-sm text-[#8A8178] mt-1">
                      <span>{link.url}</span>
                      <button onClick={() => handleCopy(link.url)} className="hover:text-[#232323] transition-colors" aria-label="Copy Link">
                        {copySuccess === link.url ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <div className="link-meta mt-2">
                      <span className="flex items-center gap-1"><Eye size={14}/> {link.access}</span>
                      <span className={`flex items-center gap-1 ${link.status === 'Expired' ? 'text-red-500' : ''}`}><Calendar size={14}/> {link.expiryDate}</span>
                    </div>
                  </div>
                  
                  {/* ACL Action Buttons */}
                  <div className="flex flex-col items-end gap-3">
                    <span className={`status-badge ${link.status === 'Active' ? 'active' : 'expired'}`}>{link.status}</span>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <button 
                        onClick={() => setManageModal({ isOpen: true, linkId: link.id, filename: link.filename })} 
                        className="flex items-center gap-1 text-sm text-[#685D54] hover:text-[#232323] font-medium"
                      >
                        <UserCog size={16} /> Manage Access
                      </button>
                      
                      <div className="w-px h-4 bg-[#EFEAE6]"></div>
                      
                      <button onClick={() => handleRevokeLink(link.id)} className="text-red-400 hover:text-red-600 transition-colors" aria-label="Revoke Entire Link">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB CONTENT: Access Levels */}
          {activeTab === 'Access Levels' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-[#232323]">Access Permissions Guide</h3>
              </div>
              <div className="flex flex-col gap-4">
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-500"><Eye size={20} /></div>
                  <div>
                    <h4 className="font-semibold text-[#232323] text-sm">View Only</h4>
                    <p className="text-xs text-[#8A8178] mt-1">Recipients can only read the file online. Downloading, copying, and printing are disabled.</p>
                  </div>
                </div>
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-green-50 p-2 rounded-lg text-green-500"><DownloadCloud size={20} /></div>
                  <div>
                    <h4 className="font-semibold text-[#232323] text-sm">Download</h4>
                    <p className="text-xs text-[#8A8178] mt-1">Recipients can view the file and download a local copy to their device.</p>
                  </div>
                </div>
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600"><MessageSquare size={20} /></div>
                  <div>
                    <h4 className="font-semibold text-[#232323] text-sm">Comment</h4>
                    <p className="text-xs text-[#8A8178] mt-1">Recipients can view the file and add feedback or notes. They cannot modify the original content.</p>
                  </div>
                </div>
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-500"><Edit size={20} /></div>
                  <div>
                    <h4 className="font-semibold text-[#232323] text-sm">Edit</h4>
                    <p className="text-xs text-[#8A8178] mt-1">Full access. Recipients can modify content, share with others, and change file settings.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Share History */}
          {activeTab === 'Share History' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#232323]">Audit Logs & History</h3>
                <button className="text-sm text-[#685D54] flex items-center gap-1 hover:underline">
                  <Download size={14} /> Export CSV
                </button>
              </div>
              
              <div className="overflow-x-auto border border-[#EFEAE6] rounded-xl">
                <table className="history-table w-full">
                  <thead className="bg-[#F8F6F4]">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-[#8A8178]">User / Email</th>
                      <th className="text-left p-3 text-xs font-semibold text-[#8A8178]">Action</th>
                      <th className="text-left p-3 text-xs font-semibold text-[#8A8178]">Time</th>
                      <th className="text-left p-3 text-xs font-semibold text-[#8A8178]">IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-[#EFEAE6] hover:bg-[#F8F6F4]">
                      <td className="p-3 text-sm text-[#232323]">client@company.com</td>
                      <td className="p-3 text-sm"><span className="bg-blue-50 text-blue-600 px-2 py-1 rounded text-xs font-medium">Viewed</span></td>
                      <td className="p-3 text-sm text-[#8A8178]">Just now</td>
                      <td className="p-3 text-sm text-[#8A8178]">192.168.1.45</td>
                    </tr>
                    <tr className="border-t border-[#EFEAE6] hover:bg-[#F8F6F4]">
                      <td className="p-3 text-sm text-[#232323]">@Finance_Team</td>
                      <td className="p-3 text-sm"><span className="bg-green-50 text-green-600 px-2 py-1 rounded text-xs font-medium">Downloaded</span></td>
                      <td className="p-3 text-sm text-[#8A8178]">2 hours ago</td>
                      <td className="p-3 text-sm text-[#8A8178]">117.20.55.102</td>
                    </tr>
                    <tr className="border-t border-[#EFEAE6] hover:bg-[#F8F6F4]">
                      <td className="p-3 text-sm text-[#232323]">unknown</td>
                      <td className="p-3 text-sm"><span className="bg-red-50 text-red-600 px-2 py-1 rounded text-xs font-medium">Access Denied</span></td>
                      <td className="p-3 text-sm text-[#8A8178]">Yesterday</td>
                      <td className="p-3 text-sm text-[#8A8178]">45.22.19.88</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SecureSharing;