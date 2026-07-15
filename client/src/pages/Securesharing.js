import React, { useState } from 'react';
import './Securesharing.css'; 
// Ensure lucide-react is installed for icons
import { Link2, Copy, Eye, Download, Calendar, X, DownloadCloud, Edit, MessageSquare } from 'lucide-react';

const SecureSharing = () => {
  // Form State
  const [accessLevel, setAccessLevel] = useState('View Only');
  const [usePassword, setUsePassword] = useState(false);
  
  // Right Panel Tabs State
  const [activeTab, setActiveTab] = useState('Share Links');

  return (
    <div className="sharing-container">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#232323]">Secure Sharing</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT PANEL: Create Share Link */}
        <div className="card-panel lg:col-span-1">
          <h2 className="text-lg font-bold text-[#232323] mb-5">Create Share Link</h2>
          
          <form className="flex flex-col gap-5">
            <div>
              <label className="block text-sm text-[#8A8178] mb-1.5">Select File</label>
              <select className="custom-input bg-white">
                <option>Q3-Financial-Report.pdf</option>
                <option>Product-Roadmap-2025.pptx</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#8A8178] mb-1.5">Access Level</label>
              <div className="grid grid-cols-2 gap-3">
                {['View Only', 'Download', 'Comment', 'Edit'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    className={`access-btn ${accessLevel === level ? 'selected' : ''}`}
                    onClick={() => setAccessLevel(level)}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-[#8A8178] mb-1.5">Expiry</label>
              <select className="custom-input bg-white">
                <option>7 days</option>
                <option>30 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#8A8178] mb-1.5">Max Downloads</label>
              <input type="number" className="custom-input" defaultValue="10" min="1" />
            </div>

            <div className="flex items-center gap-2 mt-1">
              <input 
                type="checkbox" 
                id="protect" 
                className="w-4 h-4 accent-[#685D54]"
                checked={usePassword}
                onChange={(e) => setUsePassword(e.target.checked)}
              />
              <label htmlFor="protect" className="text-sm font-medium text-[#232323] cursor-pointer">
                Require Password to Access
              </label>
            </div>

            {usePassword && (
              <div className="animate-fade-in">
                <input type="password" placeholder="Enter a strong password" className="custom-input" />
              </div>
            )}

            <div className="mt-2">
              <button type="button" className="btn-primary">
                <Link2 size={18} />
                Generate Link
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: Tabs & Content */}
        <div className="card-panel lg:col-span-2">
          
          {/* Tabs Navigation */}
          <div className="tabs-header">
            {['Share Links', 'Access Levels', 'Share History'].map((tab) => (
              <button 
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: Share Links */}
          {activeTab === 'Share Links' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#232323]">Active Share Links</h3>
                <span className="text-xs bg-[#F8F6F4] px-3 py-1 rounded-full text-[#685D54]">2 active</span>
              </div>

              {/* Active Link Item 1 */}
              <div className="link-card">
                <div>
                  <h4 className="font-semibold text-[#232323]">Q3-Financial-Report.pdf</h4>
                  <div className="flex items-center gap-2 text-sm text-[#8A8178] mt-1">
                    <span>https://vault.sh/s/Xk9m3P</span>
                    <button className="hover:text-[#232323]"><Copy size={14} /></button>
                  </div>
                  <div className="link-meta">
                    <span className="flex items-center gap-1"><Eye size={14}/> View Only</span>
                    <span className="flex items-center gap-1"><Calendar size={14}/> Jul 13, 2025</span>
                    <span className="flex items-center gap-1"><DownloadCloud size={14}/> 3/10</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="status-badge active">Active</span>
                  <button className="text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              </div>

              {/* Expired Link Item */}
              <div className="link-card">
                <div>
                  <h4 className="font-semibold text-[#232323]">brand-guidelines-v2.pdf</h4>
                  <div className="flex items-center gap-2 text-sm text-[#8A8178] mt-1">
                    <span>https://vault.sh/s/T5pL8W</span>
                    <button className="hover:text-[#232323]"><Copy size={14} /></button>
                  </div>
                  <div className="link-meta">
                    <span className="flex items-center gap-1"><Eye size={14}/> View Only</span>
                    <span className="flex items-center gap-1 text-red-500"><Calendar size={14}/> Expired</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="status-badge expired">Expired</span>
                  <button className="text-red-400 hover:text-red-600"><X size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {/* TAB CONTENT: Access Levels */}
          {activeTab === 'Access Levels' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-bold text-[#232323]">Access Permissions Guide</h3>
              </div>

              <div className="flex flex-col gap-4">
                
                {/* View Only Role */}
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-500">
                    <Eye size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#232323] text-sm">View Only</h4>
                    <p className="text-xs text-[#8A8178] mt-1">Recipients can only read the file online. Downloading, copying, and printing are disabled.</p>
                  </div>
                </div>

                {/* Download Role */}
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-green-50 p-2 rounded-lg text-green-500">
                    <DownloadCloud size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#232323] text-sm">Download</h4>
                    <p className="text-xs text-[#8A8178] mt-1">Recipients can view the file and download a local copy to their device.</p>
                  </div>
                </div>

                {/* Comment Role */}
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-yellow-50 p-2 rounded-lg text-yellow-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#232323] text-sm">Comment</h4>
                    <p className="text-xs text-[#8A8178] mt-1">Recipients can view the file and add feedback or notes. They cannot modify the original content.</p>
                  </div>
                </div>

                {/* Edit Role */}
                <div className="p-4 border border-[#EFEAE6] rounded-xl flex items-start gap-4 hover:bg-[#F8F6F4] transition-colors">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-500">
                    <Edit size={20} />
                  </div>
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
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-[#232323]">Share History</h3>
                <button className="text-sm text-[#685D54] flex items-center gap-1 hover:underline">
                  <Download size={14} /> Export
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>File</th>
                      <th>Action</th>
                      <th>Time</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>john.doe@acme.com</td>
                      <td>Q3-Financial-Report.pdf</td>
                      <td><span className="action-pill">Viewed</span></td>
                      <td>Today 11:04 AM</td>
                      <td>98.23.14.55</td>
                    </tr>
                    <tr>
                      <td>finance@partner.io</td>
                      <td>annual-audit-2024.xlsx</td>
                      <td><span className="action-pill">Downloaded</span></td>
                      <td>Today 09:30 AM</td>
                      <td>192.168.4.12</td>
                    </tr>
                    <tr>
                      <td>hr@acme.com</td>
                      <td>employee-contracts-2024.doc</td>
                      <td><span className="action-pill expired">Link Expired</span></td>
                      <td>Jul 3, 10:00 AM</td>
                      <td>--</td>
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