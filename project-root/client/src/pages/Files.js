import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Files as FilesIcon, Lock, Unlock,
  Moon, Sun, Search, FolderPlus,
  Upload, Filter, List, LayoutGrid, Folder, ChevronRight, ChevronLeft,
  MoreVertical, Share, Download, Trash2, Check, FileText,
  FileSpreadsheet, Image, Presentation, Bell,
  LayoutDashboard, Share2, Activity, BarChart2, ShieldCheck, Users, Settings // eslint-disable-line no-unused-vars
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';
import { filesAPI, foldersAPI } from '../utils/api';
import Modal from '../components/Modals/Modal';
import { getEncryptionKey, encryptText, decryptText, encryptFileBytes, decryptFileBytes } from '../utils/crypto';


/* ─── Nav Items ─────────────────────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Dashboard',         icon: LayoutDashboard, active: false },
  { label: 'My Files',          icon: FilesIcon,       to: '/files', active: true },
  { label: 'Secure Sharing',    icon: Share2,           active: false },
  { label: 'Encryption',        icon: ShieldCheck,      active: false },
  { label: 'Activity Logs',     icon: Activity,         active: false },
  { label: 'Notifications',     icon: Bell,             active: false, badge: 4 },
  { label: 'Analytics',         icon: BarChart2,        active: false },
  { label: 'Admin Panel',       icon: Users,            active: false },
  { label: 'Profile & Settings',icon: Settings,         active: false },
];

/* ─── Tag Badge ─────────────────────────────────────────────────── */
function Tag({ label }) {
  const styles = {
    Encrypted: { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },
    Shared:    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },
  };
  const s = styles[label] || { bg: '#f1f5f9', color: '#64748b' };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99, fontSize: '0.7rem', fontWeight: 600,
      background: s.bg, color: s.color,
    }}>
      {label === 'Encrypted' && (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      )}
      {label}
    </span>
  );
}

/* ─── Shield Logo Icon ──────────────────────────────────────────── */
function ShieldLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"
        fill="url(#shieldGrad)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5"
      />
      <path
        d="M9 12l2 2 4-4"
        stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="shieldGrad" x1="4" y1="2" x2="20" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Sidebar ───────────────────────────────────────────────────── */
function Sidebar({ collapsed, onToggle, user, onLogout, theme, onToggleTheme }) {
  const navigate = useNavigate();
  return (
    <aside style={{
      width: collapsed ? 68 : 240,
      minWidth: collapsed ? 68 : 240,
      background: '#0d1117',
      display: 'flex', flexDirection: 'column',
      height: '100vh', flexShrink: 0,
      transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1), min-width 0.25s cubic-bezier(0.4,0,0.2,1)',
      overflow: 'hidden',
      position: 'relative',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    }}>

      {/* ── Logo row ── */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: collapsed ? '20px 0' : '20px 16px 18px',
        justifyContent: collapsed ? 'center' : 'space-between',
        flexShrink: 0,
      }}>
        {/* Logo + name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          {/* Shield circle */}
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'linear-gradient(135deg,#3b82f6 0%,#6366f1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, boxShadow: '0 0 12px rgba(99,102,241,0.35)',
          }}>
            <ShieldLogo size={19} />
          </div>
          {!collapsed && (
            <span style={{
              color: '#f1f5f9', fontWeight: 700, fontSize: '1.08rem',
              letterSpacing: '-0.01em', whiteSpace: 'nowrap',
            }}>SecureShare</span>
          )}
        </div>
        {/* Collapse toggle */}
        {!collapsed && (
          <button
            onClick={onToggle}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#475569', padding: 4, display: 'flex', alignItems: 'center',
              borderRadius: 6, flexShrink: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {collapsed && (
          <button
            onClick={onToggle}
            style={{
              position: 'absolute', right: -1, top: 22,
              background: '#1e2736', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', color: '#64748b',
              borderRadius: '0 6px 6px 0',
              padding: '4px 3px', display: 'flex', alignItems: 'center',
            }}
          >
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      {/* ── Nav ── */}
      <nav style={{
        flex: 1, padding: '4px 10px 4px',
        display: 'flex', flexDirection: 'column', gap: 1,
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        {NAV_ITEMS.map(({ label, icon: Icon, active, badge, to }) => (
          <button
            key={label}
            type="button"
            title={collapsed ? label : undefined}
            onClick={() => to && navigate(to)}
            style={{
              display: 'flex', alignItems: 'center',
              gap: 12,
              padding: collapsed ? '11px 0' : '10px 14px',
              borderRadius: 9, border: 'none', cursor: 'pointer',
              justifyContent: collapsed ? 'center' : 'flex-start',
              background: active ? 'linear-gradient(90deg,rgba(59,130,246,0.25) 0%,rgba(99,102,241,0.12) 100%)' : 'transparent',
              color: active ? '#60a5fa' : '#64748b',
              fontWeight: active ? 600 : 400,
              fontSize: '0.9rem',
              width: '100%', textAlign: 'left',
              transition: 'background 0.15s, color 0.15s',
              position: 'relative',
              borderLeft: active ? '2px solid #3b82f6' : '2px solid transparent',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => {
              if (!active) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#94a3b8';
              }
            }}
            onMouseLeave={e => {
              if (!active) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#64748b';
              }
            }}
          >
            <Icon size={17} style={{ flexShrink: 0, opacity: active ? 1 : 0.75 }} />
            {!collapsed && <span style={{ whiteSpace: 'nowrap', flex: 1 }}>{label}</span>}
            {!collapsed && badge && (
              <span style={{
                background: '#3b82f6', color: '#fff',
                borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
                padding: '2px 8px', lineHeight: 1.5, flexShrink: 0,
              }}>{badge}</span>
            )}
            {collapsed && badge && (
              <span style={{
                position: 'absolute', top: 5, right: 5,
                width: 15, height: 15, borderRadius: '50%',
                background: '#3b82f6', color: '#fff',
                fontSize: '0.55rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div style={{
        padding: '8px 10px 16px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', gap: 1,
      }}>
        {/* Dark Mode toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          title={collapsed ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : undefined}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '11px 0' : '10px 14px',
            borderRadius: 9, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#64748b',
            fontSize: '0.9rem', width: '100%', textAlign: 'left',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
        >
          {theme === 'dark'
            ? <Sun size={17} style={{ flexShrink: 0, opacity: 0.75 }} />
            : <Moon size={17} style={{ flexShrink: 0, opacity: 0.75 }} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>
      </div>
    </aside>
  );
}

/* ─── Top Bar ───────────────────────────────────────────────────── */
function TopBar({ user, colors, filter, setFilter }) {
  const navigate = useNavigate();
  return (
    <div style={{
      height: 60, background: colors.bgTopBar,
      borderBottom: `1px solid ${colors.border}`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', gap: 16, flexShrink: 0,
      transition: 'background-color 0.2s, border-color 0.2s',
    }}>
      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
        <Search size={15} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: colors.textMuted,
        }} />
        <input
          type="text"
          placeholder="Search files..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px 8px 36px',
            border: `1px solid ${colors.inputBorder}`, borderRadius: 8,
            background: colors.inputBg, fontSize: '0.85rem', color: colors.textPrimary,
            outline: 'none', boxSizing: 'border-box',
            transition: 'background-color 0.2s, border-color 0.2s, color 0.2s',
          }}
        />
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Bell */}
        <div style={{ position: 'relative' }}>
          <button type="button" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '6px', borderRadius: 8, color: colors.textSecondary,
            display: 'flex', alignItems: 'center',
          }}>
            <Bell size={20} />
          </button>
          <span style={{
            position: 'absolute', top: 2, right: 2,
            width: 8, height: 8, borderRadius: '50%',
            background: '#3b82f6', border: `2px solid ${colors.bgTopBar}`,
          }} />
        </div>

        {/* User */}
        <div
          onClick={() => navigate('/settings')}
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
          }}>
            {(user?.full_name || 'AJ').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}>
              {user?.full_name || 'Alex Johnson'}
            </div>
            <div style={{ fontSize: '0.7rem', color: colors.textMuted }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Icons & Format Helpers ───────────────────────────────────── */
const getFileIconInfo = (mimetype, filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  if (['xlsx', 'xls', 'csv'].includes(ext) || mimetype.includes('spreadsheet') || mimetype.includes('excel')) {
    return { icon: FileSpreadsheet, color: '#10b981' };
  }
  if (['docx', 'doc', 'pdf', 'txt', 'md'].includes(ext) || mimetype.includes('text') || mimetype.includes('pdf') || mimetype.includes('document')) {
    return { icon: FileText, color: '#ef4444' };
  }
  if (['pptx', 'ppt'].includes(ext) || mimetype.includes('presentation') || mimetype.includes('powerpoint')) {
    return { icon: Presentation, color: '#f97316' };
  }
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext) || mimetype.startsWith('image/')) {
    return { icon: Image, color: '#8b5cf6' };
  }
  return { icon: FileText, color: '#64748b' };
};

const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function Files() {
  const { user, logoutUser, theme, toggleTheme } = useAnalytics();
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [filter, setFilter] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [selected, setSelected] = useState(new Set());
  const inputRef = useRef();

  // Dynamic States
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: null, name: 'Home' }]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newFolderModalOpen, setNewFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [hoveredFileId, setHoveredFileId] = useState(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);


  const isDark = theme === 'dark';
  const colors = {
    bgPage: isDark ? '#0f172a' : '#f0f4f8',
    bgCard: isDark ? '#1e293b' : '#ffffff',
    bgTopBar: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '#334155' : '#e8edf2',
    borderDashed: isDark ? '#475569' : '#cbd5e1',
    textPrimary: isDark ? '#f8fafc' : '#0f172a',
    textSecondary: isDark ? '#cbd5e1' : '#475569',
    textMuted: isDark ? '#64748b' : '#94a3b8',
    rowHover: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafbfc',
    inputBg: isDark ? '#0f172a' : '#f8fafc',
    inputBorder: isDark ? '#334155' : '#e2e8f0',
    folderCardHoverBorder: isDark ? '#475569' : '#c7d7e8',
  };

  const [cryptoKey, setCryptoKey] = useState(null);

  // Initialize E2EE key on load
  useEffect(() => {
    async function initKey() {
      const email = user?.email || "alex@secureshare.local";
      const key = await getEncryptionKey(email);
      setCryptoKey(key);
    }
    initKey();
  }, [user]);

  // Fetch folders and files
  const fetchData = async () => {
    if (!cryptoKey) return;
    setLoading(true);
    try {
      const [filesRes, foldersRes] = await Promise.all([
        filesAPI.list(currentFolderId),
        foldersAPI.list(currentFolderId)
      ]);
      
      const rawFiles = filesRes.data.files || [];
      const decryptedFiles = await Promise.all(
        rawFiles.map(async (f) => {
          const isE2EE = f.original_name.startsWith("e2ee:");
          const decName = await decryptText(f.original_name, cryptoKey);
          const decMime = await decryptText(f.mimetype, cryptoKey);
          return { ...f, original_name: decName, mimetype: decMime, isE2EE };
        })
      );

      setFiles(decryptedFiles);
      setFolders(foldersRes.data.folders || []);
    } catch (err) {
      console.error("Failed to load files/folders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cryptoKey) {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFolderId, cryptoKey]);

  // Folder navigation
  const navigateToFolder = (folder) => {
    setCurrentFolderId(folder.id);
    setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]);
    setSelected(new Set());
  };

  const navigateToBreadcrumb = (index) => {
    const nextBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(nextBreadcrumbs);
    setCurrentFolderId(nextBreadcrumbs[nextBreadcrumbs.length - 1].id);
    setSelected(new Set());
  };

  // Create Folder
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await foldersAPI.create(newFolderName, currentFolderId);
      setNewFolderName('');
      setNewFolderModalOpen(false);
      fetchData();
    } catch (err) {
      console.error("Failed to create folder:", err);
    }
  };

  // Delete Folder
  const handleDeleteFolder = async (folderId, folderName) => {
    if (!window.confirm(`Are you sure you want to delete the folder "${folderName}" and all its contents?`)) return;
    try {
      await foldersAPI.delete(folderId);
      fetchData();
    } catch (err) {
      console.error("Failed to delete folder:", err);
    }
  };

  // File Upload
  const handleFileUpload = async (e) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        
        let fileToUpload = file;
        let originalName = file.name;
        let encryptedMime = file.type || 'application/octet-stream';

        if (cryptoKey) {
          // Encrypt file bytes client-side
          const encryptedBlob = await encryptFileBytes(file, cryptoKey);
          originalName = await encryptText(file.name, cryptoKey);
          encryptedMime = await encryptText(encryptedMime, cryptoKey);
          fileToUpload = encryptedBlob;
        }

        const formData = new FormData();
        formData.append('file', fileToUpload, originalName);

        await filesAPI.upload(
          formData,
          currentFolderId,
          true, // encrypted=true
          encryptedMime,
          (progress) => {
            setUploadProgress(progress);
          }
        );
      }
      fetchData();
    } catch (err) {
      console.error("Failed to upload file:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  // Drop files
  const handleDrop = async (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < droppedFiles.length; i++) {
        const file = droppedFiles[i];
        
        let fileToUpload = file;
        let originalName = file.name;
        let encryptedMime = file.type || 'application/octet-stream';

        if (cryptoKey) {
          const encryptedBlob = await encryptFileBytes(file, cryptoKey);
          originalName = await encryptText(file.name, cryptoKey);
          encryptedMime = await encryptText(encryptedMime, cryptoKey);
          fileToUpload = encryptedBlob;
        }

        const formData = new FormData();
        formData.append('file', fileToUpload, originalName);

        await filesAPI.upload(
          formData,
          currentFolderId,
          true, // encrypted=true
          encryptedMime,
          (progress) => {
            setUploadProgress(progress);
          }
        );
      }
      fetchData();
    } catch (err) {
      console.error("Failed to upload dropped file:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Download File
  const handleDownloadFile = async (file) => {
    try {
      const res = await filesAPI.download(file.id);
      let dataBlob = res.data;

      if (cryptoKey && file.encrypted && file.isE2EE) {
        const arrayBuf = await res.data.arrayBuffer();
        dataBlob = await decryptFileBytes(arrayBuf, cryptoKey, file.mimetype);
      }

      const url = window.URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.original_name);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error("Failed to download file:", err);
    }
  };

  // Delete File
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await filesAPI.delete(fileId);
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(fileId);
        return next;
      });
      fetchData();
    } catch (err) {
      console.error("Failed to delete file:", err);
    }
  };

  // Toggle Encryption
  const handleToggleEncrypt = async (file) => {
    try {
      const res = await filesAPI.toggleEncrypt(file.id);
      // Update the file in local state immediately for instant UI feedback
      setFiles(prev => prev.map(f => f.id === file.id ? { ...f, encrypted: res.data.encrypted } : f));
    } catch (err) {
      console.error('Failed to toggle encryption:', err);
    }
  };

  // Search/Filter & Sort
  const filteredFiles = files
    .filter(f => {
      const matchesText = f.original_name.toLowerCase().includes(filter.toLowerCase());
      if (statusFilter === 'encrypted') return matchesText && f.encrypted;
      if (statusFilter === 'plaintext') return matchesText && !f.encrypted;
      return matchesText;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'created_at') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  // Selection
  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const allSelected = filteredFiles.length > 0 && filteredFiles.every(f => selected.has(f.id));
  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filteredFiles.map(f => f.id)));
  };

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      background: colors.bgPage,
      transition: 'background-color 0.2s',
    }}>
      <style>{`
        @keyframes encryptGlow {
          0% {
            box-shadow: 0 0 6px 1px rgba(16, 185, 129, 0.35);
            background-color: rgba(16, 185, 129, 0.08);
          }
          50% {
            box-shadow: 0 0 14px 4px rgba(16, 185, 129, 0.6);
            background-color: rgba(16, 185, 129, 0.2);
          }
          100% {
            box-shadow: 0 0 6px 1px rgba(16, 185, 129, 0.35);
            background-color: rgba(16, 185, 129, 0.08);
          }
        }
      `}</style>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        user={user}
        onLogout={logoutUser}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Right Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <TopBar user={user} colors={colors} filter={filter} setFilter={setFilter} />

        {/* Scrollable Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>

          {/* Page Heading */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: colors.textPrimary, margin: 0 }}>My Files</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, fontSize: '0.8rem', color: colors.textMuted }}>
                {breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight size={13} />}
                    <span
                      onClick={() => navigateToBreadcrumb(idx)}
                      style={{
                        cursor: 'pointer',
                        fontWeight: idx === breadcrumbs.length - 1 ? 600 : 400,
                        color: idx === breadcrumbs.length - 1 ? colors.textSecondary : colors.textMuted
                      }}
                    >
                      {crumb.name}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={() => setNewFolderModalOpen(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 16px', borderRadius: 8,
                  border: `1.5px solid ${colors.borderDashed}`, background: colors.bgCard,
                  color: colors.textPrimary, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                <FolderPlus size={16} /> New Folder
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 18px', borderRadius: 8,
                  border: 'none', background: '#3b82f6',
                  color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                <Upload size={16} /> Upload
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>

          {/* Drop Zone / Upload Progress */}
          {uploading ? (
            <div
              style={{
                borderRadius: 12,
                background: colors.bgCard,
                padding: '32px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                border: `1px solid ${colors.border}`,
                marginBottom: 24,
              }}
            >
              <div style={{ fontSize: '0.9rem', fontWeight: 600, color: colors.textPrimary }}>
                Uploading files... {uploadProgress}%
              </div>
              <div style={{ width: '100%', maxWidth: '300px', height: '6px', background: isDark ? '#334155' : '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#3b82f6', transition: 'width 0.1s ease' }}></div>
              </div>
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragging ? '#3b82f6' : colors.borderDashed}`,
                borderRadius: 12,
                background: dragging ? 'rgba(59,130,246,0.04)' : colors.bgCard,
                padding: '32px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                cursor: 'pointer', marginBottom: 24,
                transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: '50%',
                border: `2px solid ${colors.borderDashed}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: colors.textMuted,
              }}>
                <Upload size={20} />
              </div>
              <div style={{ fontSize: '0.9rem', color: colors.textSecondary }}>
                Drag &amp; drop files here, or{' '}
                <span style={{ color: '#3b82f6', fontWeight: 600, textDecoration: 'underline' }}>browse</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                Supports all file types · AES-256 encrypted on upload · Max 5 GB per file
              </div>
            </div>
          )}

          {/* Folders Section */}
          {folders.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: colors.textPrimary, marginBottom: 14 }}>
                Folders
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {folders.map((f, idx) => {
                  // Cycle through accent colors like the screenshot
                  const FOLDER_ACCENTS = [
                    { bg: 'rgba(16,185,129,0.12)', color: '#10b981' },   // green
                    { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6' },   // blue
                    { bg: 'rgba(139,92,246,0.12)',  color: '#8b5cf6' },   // purple
                    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b' },   // amber
                  ];
                  const accent = FOLDER_ACCENTS[idx % FOLDER_ACCENTS.length];

                  const sizeLabel = f.total_size > 0 ? formatBytes(f.total_size) : '0 Bytes';
                  const countLabel = f.file_count === 1 ? '1 file' : `${f.file_count} files`;

                  return (
                    <div
                      key={f.id}
                      onClick={() => navigateToFolder(f)}
                      style={{
                        background: colors.bgCard,
                        borderRadius: 14,
                        border: `1px solid ${colors.border}`,
                        padding: '16px 18px',
                        display: 'flex', alignItems: 'center', gap: 14,
                        cursor: 'pointer',
                        transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.1s',
                        position: 'relative',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
                        e.currentTarget.style.borderColor = accent.color + '66';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {/* Folder icon */}
                      <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: accent.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Folder size={21} color={accent.color} strokeWidth={1.8} />
                      </div>

                      {/* Name + stats */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 700, fontSize: '0.9rem',
                          color: colors.textPrimary,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: colors.textMuted, marginTop: 3 }}>
                          {countLabel} · {sizeLabel}
                        </div>
                      </div>

                      {/* Delete btn */}
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); handleDeleteFolder(f.id, f.name); }}
                        title="Delete folder"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: colors.textMuted, display: 'flex', alignItems: 'center',
                          padding: '5px', borderRadius: 6, flexShrink: 0,
                          opacity: 0,
                          transition: 'opacity 0.15s, color 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = colors.textMuted; e.currentTarget.style.opacity = '1'; }}
                        ref={el => {
                          if (el) {
                            el.closest('div[data-folder]')?.addEventListener('mouseenter', () => el.style.opacity = '1');
                            el.closest('div[data-folder]')?.addEventListener('mouseleave', () => el.style.opacity = '0');
                          }
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}


          {/* Files List Section */}
          <div style={{ background: colors.bgCard, borderRadius: 12, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
            {/* Filter Bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '14px 18px', borderBottom: `1px solid ${colors.border}`,
            }}>
              <div style={{ position: 'relative', width: 220 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: colors.textMuted }} />
                <input
                  type="text"
                  placeholder="Filter files..."
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  style={{
                    width: '100%', padding: '7px 10px 7px 30px',
                    border: `1px solid ${colors.inputBorder}`, borderRadius: 8,
                    fontSize: '0.82rem', color: colors.textPrimary, background: colors.inputBg,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => { setFilterDropdownOpen(!filterDropdownOpen); setSortDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8,
                    border: `1.5px solid ${statusFilter !== 'all' ? '#3b82f6' : colors.inputBorder}`,
                    background: statusFilter !== 'all' ? 'rgba(59,130,246,0.05)' : colors.bgCard,
                    color: statusFilter !== 'all' ? '#3b82f6' : colors.textSecondary,
                    fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  <Filter size={14} /> Filter{statusFilter !== 'all' ? `: ${statusFilter}` : ''}
                </button>
                {filterDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6,
                    background: colors.bgCard, border: `1px solid ${colors.border}`,
                    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 50, minWidth: 140, padding: '4px 0',
                  }}>
                    {[
                      { value: 'all', label: 'All Files' },
                      { value: 'encrypted', label: 'Encrypted Only' },
                      { value: 'plaintext', label: 'Plaintext Only' },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => { setStatusFilter(opt.value); setFilterDropdownOpen(false); }}
                        style={{
                          padding: '8px 12px', fontSize: '0.8rem', color: colors.textPrimary,
                          cursor: 'pointer', background: statusFilter === opt.value ? colors.rowHover : 'transparent',
                          fontWeight: statusFilter === opt.value ? 600 : 400,
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = colors.rowHover}
                        onMouseLeave={e => e.currentTarget.style.background = statusFilter === opt.value ? colors.rowHover : 'transparent'}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => { setSortDropdownOpen(!sortDropdownOpen); setFilterDropdownOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 8,
                    border: `1px solid ${colors.inputBorder}`, background: colors.bgCard,
                    color: colors.textSecondary, fontSize: '0.82rem', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="9" y2="18" />
                  </svg>
                  Sort
                </button>
                {sortDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, marginTop: 6,
                    background: colors.bgCard, border: `1px solid ${colors.border}`,
                    borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 50, minWidth: 160, padding: '4px 0',
                  }}>
                    {[
                      { value: 'original_name', label: 'Name' },
                      { value: 'size', label: 'Size' },
                      { value: 'created_at', label: 'Date Modified' },
                      { value: 'encrypted', label: 'Encryption Status' },
                    ].map(opt => (
                      <div
                        key={opt.value}
                        onClick={() => {
                          if (sortField === opt.value) {
                            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortField(opt.value);
                            setSortDirection('asc');
                          }
                          setSortDropdownOpen(false);
                        }}
                        style={{
                          padding: '8px 12px', fontSize: '0.8rem', color: colors.textPrimary,
                          cursor: 'pointer', background: sortField === opt.value ? colors.rowHover : 'transparent',
                          fontWeight: sortField === opt.value ? 600 : 400,
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = colors.rowHover}
                        onMouseLeave={e => e.currentTarget.style.background = sortField === opt.value ? colors.rowHover : 'transparent'}
                      >
                        <span>{opt.label}</span>
                        {sortField === opt.value && (
                          <span style={{ fontSize: '0.7rem', color: '#3b82f6' }}>
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* View Toggle */}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: 8, padding: 3 }}>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: viewMode === 'list' ? '#3b82f6' : 'transparent',
                    color: viewMode === 'list' ? '#fff' : colors.textMuted,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <List size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  style={{
                    padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: viewMode === 'grid' ? '#3b82f6' : 'transparent',
                    color: viewMode === 'grid' ? '#fff' : colors.textMuted,
                    display: 'flex', alignItems: 'center',
                  }}
                >
                  <LayoutGrid size={15} />
                </button>
              </div>
            </div>

            {/* Table / List View */}
            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: colors.textMuted, fontSize: '0.9rem' }}>
                Loading files...
              </div>
            ) : (
              <>
                {viewMode === 'grid' ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
                    gap: 16,
                    padding: 20,
                  }}>
                    {filteredFiles.map((f) => {
                      const { icon: FileIconComponent, color: iconColor } = getFileIconInfo(f.mimetype, f.original_name);
                      const isSelected = selected.has(f.id);
                      const isHovered = hoveredFileId === f.id;

                      return (
                        <div
                          key={f.id}
                          onMouseEnter={e => {
                            setHoveredFileId(f.id);
                            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }}
                          onMouseLeave={e => {
                            setHoveredFileId(null);
                            e.currentTarget.style.boxShadow = isSelected ? '0 4px 12px rgba(59,130,246,0.15)' : 'none';
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                          style={{
                            background: colors.bgCard,
                            borderRadius: 12,
                            border: `1px solid ${isSelected ? '#3b82f6' : colors.border}`,
                            padding: 16,
                            display: 'flex',
                            flexDirection: 'column',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'box-shadow 0.15s, border-color 0.15s, transform 0.1s',
                            boxShadow: isSelected ? '0 4px 12px rgba(59,130,246,0.15)' : 'none',
                          }}
                        >
                          {/* Top Bar inside Card */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            {/* Checkbox */}
                            <div onClick={e => { e.stopPropagation(); toggleSelect(f.id); }}>
                              <Checkbox checked={isSelected} onChange={() => toggleSelect(f.id)} colors={colors} />
                            </div>
                            {/* Status Badge */}
                            {f.encrypted && <Tag label="Encrypted" />}
                          </div>

                          {/* File Icon Centered */}
                          <div
                            onClick={() => handleDownloadFile(f)}
                            style={{
                              height: 74,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: iconColor + '08',
                              borderRadius: 8,
                              marginBottom: 12,
                            }}
                          >
                            <FileIconComponent size={34} color={iconColor} />
                          </div>

                          {/* Title & Metadata */}
                          <div style={{ flex: 1, minWidth: 0 }} onClick={() => handleDownloadFile(f)}>
                            <div style={{
                              fontWeight: 600,
                              fontSize: '0.84rem',
                              color: colors.textPrimary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              marginBottom: 4,
                            }}>
                              {f.original_name}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: colors.textMuted }}>
                              {formatBytes(f.size)} • {f.version} {f.version === 1 ? 'version' : 'versions'}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: colors.textMuted, marginTop: 2 }}>
                              {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                          </div>

                          {/* Hover Actions at Bottom */}
                          <div style={{
                            display: 'flex', gap: 3, justifyContent: 'flex-end', alignItems: 'center',
                            marginTop: 12,
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.15s ease',
                            pointerEvents: isHovered ? 'auto' : 'none',
                            height: 26,
                          }}>
                            {[
                              { icon: Share,        title: 'Share',    danger: false, isEnc: false },
                              { icon: Download,     title: 'Download', danger: false, isEnc: false, action: (e) => { e.stopPropagation(); handleDownloadFile(f); } },
                              { icon: f.encrypted ? Unlock : Lock, title: f.encrypted ? 'Decrypt' : 'Encrypt', danger: false, isEnc: f.encrypted, action: (e) => { e.stopPropagation(); handleToggleEncrypt(f); } },
                              { icon: Trash2,       title: 'Delete',   danger: true,  isEnc: false, action: (e) => { e.stopPropagation(); handleDeleteFile(f.id); } },
                              { icon: MoreVertical, title: 'More',     danger: false, isEnc: false },
                            ].map(({ icon: Ic, title, danger, isEnc, action }) => (
                              <button
                                key={title}
                                type="button"
                                title={title}
                                onClick={action || ((e) => e.stopPropagation())}
                                style={{
                                  background: isEnc ? 'rgba(16,185,129,0.12)' : 'none',
                                  border: `1px solid ${isEnc ? '#10b981' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')}`,
                                  cursor: 'pointer',
                                  padding: '4px 6px',
                                  borderRadius: 6,
                                  color: isEnc ? '#10b981' : danger ? '#ef4444' : colors.textSecondary,
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'background 0.12s, color 0.12s, border-color 0.12s, box-shadow 0.2s',
                                  boxShadow: isEnc ? '0 0 8px 2px rgba(16,185,129,0.4)' : 'none',
                                  animation: isEnc ? 'encryptGlow 2s ease-in-out infinite' : 'none',
                                }}
                                onMouseEnter={e => {
                                  if (!isEnc) {
                                    e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9');
                                    e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.3)' : (isDark ? 'rgba(255,255,255,0.2)' : '#c7d2da');
                                    e.currentTarget.style.color = danger ? '#ef4444' : colors.textPrimary;
                                  }
                                }}
                                onMouseLeave={e => {
                                  if (!isEnc) {
                                    e.currentTarget.style.background = 'none';
                                    e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                                    e.currentTarget.style.color = danger ? '#ef4444' : colors.textSecondary;
                                  }
                                }}
                              >
                                <Ic size={13} strokeWidth={1.8} />
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <th style={{ width: 44, padding: '10px 0 10px 18px' }}>
                        <Checkbox checked={allSelected} onChange={toggleAll} colors={colors} />
                      </th>
                      {[
                        { label: 'NAME', field: 'original_name' },
                        { label: 'SIZE', field: 'size' },
                        { label: 'MODIFIED', field: 'created_at' },
                        { label: 'OWNER', field: null },
                        { label: 'STATUS', field: 'encrypted' },
                        { label: '', field: null }
                      ].map((col, i) => {
                        const isSortable = col.field !== null;
                        const isActive = sortField === col.field;
                        return (
                          <th
                            key={i}
                            onClick={() => {
                              if (!isSortable) return;
                              if (isActive) {
                                setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                              } else {
                                setSortField(col.field);
                                setSortDirection('asc');
                              }
                            }}
                            style={{
                              textAlign: 'left', padding: '10px 12px',
                              fontSize: '0.65rem', fontWeight: 700, color: isActive ? '#3b82f6' : colors.textMuted,
                              letterSpacing: '0.06em', textTransform: 'uppercase',
                              whiteSpace: 'nowrap',
                              cursor: isSortable ? 'pointer' : 'default',
                              userSelect: 'none',
                            }}
                          >
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {col.label}
                              {isActive && (
                                <span style={{ fontSize: '0.6rem' }}>
                                  {sortDirection === 'asc' ? '▲' : '▼'}
                                </span>
                              )}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((f, i) => {
                      const { icon: FileIconComponent, color: iconColor } = getFileIconInfo(f.mimetype, f.original_name);
                      const isSelected = selected.has(f.id);
                      const isHovered = hoveredFileId === f.id;

                      return (
                        <tr
                          key={f.id}
                          onMouseEnter={() => setHoveredFileId(f.id)}
                          onMouseLeave={() => setHoveredFileId(null)}
                          style={{
                            borderBottom: i < filteredFiles.length - 1 ? `1px solid ${colors.border}` : 'none',
                            background: isSelected
                              ? 'rgba(59,130,246,0.05)'
                              : isHovered
                              ? (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc')
                              : 'transparent',
                            cursor: 'pointer',
                            transition: 'background 0.12s',
                          }}
                        >
                          {/* Checkbox */}
                          <td style={{ padding: '12px 0 12px 18px', width: 44 }}
                            onClick={e => { e.stopPropagation(); toggleSelect(f.id); }}>
                            <Checkbox checked={isSelected} onChange={() => toggleSelect(f.id)} colors={colors} />
                          </td>

                          {/* Name */}
                          <td style={{ padding: '12px' }} onClick={() => handleDownloadFile(f)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: 8,
                                background: iconColor + '18',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                flexShrink: 0,
                              }}>
                                <FileIconComponent size={17} color={iconColor} />
                              </div>
                              <div>
                                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: colors.textPrimary }}>{f.original_name}</div>
                                <div style={{ fontSize: '0.7rem', color: colors.textMuted, marginTop: 1 }}>
                                  {f.version} {f.version === 1 ? 'version' : 'versions'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Size */}
                          <td style={{ padding: '12px', fontSize: '0.82rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                            {formatBytes(f.size)}
                          </td>

                          {/* Modified */}
                          <td style={{ padding: '12px', fontSize: '0.82rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>
                            {new Date(f.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>

                          {/* Owner */}
                          <td style={{ padding: '12px', fontSize: '0.82rem', color: colors.textSecondary, whiteSpace: 'nowrap' }}>Me</td>

                          {/* Status */}
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {f.encrypted && <Tag label="Encrypted" />}
                            </div>
                          </td>

                          {/* Hover Actions */}
                          <td style={{ padding: '12px 18px 12px 4px', width: 160 }}>
                            <div style={{
                              display: 'flex', gap: 4, justifyContent: 'flex-end', alignItems: 'center',
                              opacity: isHovered ? 1 : 0,
                              transition: 'opacity 0.15s ease',
                              pointerEvents: isHovered ? 'auto' : 'none',
                            }}>
                              {[
                                { icon: Share,        title: 'Share',    danger: false, isEnc: false },
                                { icon: Download,     title: 'Download', danger: false, isEnc: false, action: (e) => { e.stopPropagation(); handleDownloadFile(f); } },
                                { icon: f.encrypted ? Unlock : Lock, title: f.encrypted ? 'Decrypt' : 'Encrypt', danger: false, isEnc: f.encrypted, action: (e) => { e.stopPropagation(); handleToggleEncrypt(f); } },
                                { icon: Trash2,       title: 'Delete',   danger: true,  isEnc: false, action: (e) => { e.stopPropagation(); handleDeleteFile(f.id); } },
                                { icon: MoreVertical, title: 'More',     danger: false, isEnc: false },
                              ].map(({ icon: Ic, title, danger, isEnc, action }) => (
                                <button
                                  key={title}
                                  type="button"
                                  title={title}
                                  onClick={action || ((e) => e.stopPropagation())}
                                  style={{
                                    background: isEnc ? 'rgba(16,185,129,0.12)' : 'none',
                                    border: `1px solid ${isEnc ? '#10b981' : (isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0')}`,
                                    cursor: 'pointer',
                                    padding: '5px 7px',
                                    borderRadius: 7,
                                    color: isEnc ? '#10b981' : danger ? '#ef4444' : colors.textSecondary,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'background 0.12s, color 0.12s, border-color 0.12s, box-shadow 0.2s',
                                    boxShadow: isEnc ? '0 0 8px 2px rgba(16,185,129,0.4)' : 'none',
                                    animation: isEnc ? 'encryptGlow 2s ease-in-out infinite' : 'none',
                                  }}
                                  onMouseEnter={e => {
                                    if (!isEnc) {
                                      e.currentTarget.style.background = danger ? 'rgba(239,68,68,0.08)' : (isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9');
                                      e.currentTarget.style.borderColor = danger ? 'rgba(239,68,68,0.3)' : (isDark ? 'rgba(255,255,255,0.2)' : '#c7d2da');
                                      e.currentTarget.style.color = danger ? '#ef4444' : colors.textPrimary;
                                    }
                                  }}
                                  onMouseLeave={e => {
                                    if (!isEnc) {
                                      e.currentTarget.style.background = 'none';
                                      e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
                                      e.currentTarget.style.color = danger ? '#ef4444' : colors.textSecondary;
                                    }
                                  }}
                                >
                                  <Ic size={14} strokeWidth={1.8} />
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

                {filteredFiles.length === 0 && (
                  <div style={{ padding: '40px', textAlign: 'center', color: colors.textMuted, fontSize: '0.85rem' }}>
                    No files found.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* New Folder Modal */}
      <Modal
        isOpen={newFolderModalOpen}
        onClose={() => { setNewFolderModalOpen(false); setNewFolderName(''); }}
        title="Create New Folder"
        subtitle="Organize your encrypted files into a named folder."
        size="sm"
        isDark={isDark}
        icon={
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <defs>
              <linearGradient id="folderGrad" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#3b82f6"/>
                <stop offset="100%" stopColor="#6366f1"/>
              </linearGradient>
            </defs>
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="url(#folderGrad)"/>
          </svg>
        }
      >
        <form onSubmit={handleCreateFolder} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Input field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <label style={{
              fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.06em',
              color: colors.textSecondary, textTransform: 'uppercase',
            }}>
              Folder Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                color: colors.textMuted, display: 'flex', alignItems: 'center', pointerEvents: 'none',
              }}>
                <FolderPlus size={16} />
              </span>
              <input
                type="text"
                autoFocus
                placeholder="e.g. Finance, Marketing, Legal..."
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                maxLength={64}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '12px 44px 12px 42px',
                  borderRadius: 10,
                  border: `1.5px solid ${colors.inputBorder}`,
                  background: colors.inputBg,
                  color: colors.textPrimary,
                  outline: 'none',
                  fontSize: '0.92rem',
                  fontWeight: 500,
                  transition: 'border-color 0.2s, box-shadow 0.2s',
                }}
                onFocus={e => {
                  e.target.style.borderColor = 'rgba(99,102,241,0.6)';
                  e.target.style.boxShadow = `0 0 0 3px ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)'}`;
                }}
                onBlur={e => {
                  e.target.style.borderColor = colors.inputBorder;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {newFolderName.length > 0 && (
                <span style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: '0.72rem', color: colors.textMuted, fontWeight: 500,
                }}>
                  {newFolderName.length}/64
                </span>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: colors.border }} />

          {/* Action buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={() => { setNewFolderModalOpen(false); setNewFolderName(''); }}
              style={{
                padding: '10px 20px', borderRadius: 9,
                border: `1px solid ${colors.inputBorder}`,
                background: colors.inputBg,
                color: colors.textSecondary, cursor: 'pointer',
                fontSize: '0.87rem', fontWeight: 500,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
                e.currentTarget.style.color = colors.textPrimary;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = colors.inputBg;
                e.currentTarget.style.color = colors.textSecondary;
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!newFolderName.trim()}
              style={{
                padding: '10px 22px', borderRadius: 9, border: 'none',
                background: newFolderName.trim()
                  ? 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
                  : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'),
                color: newFolderName.trim() ? '#fff' : colors.textMuted,
                cursor: newFolderName.trim() ? 'pointer' : 'not-allowed',
                fontSize: '0.87rem', fontWeight: 600,
                boxShadow: newFolderName.trim() ? '0 4px 16px rgba(99,102,241,0.3)' : 'none',
                display: 'flex', alignItems: 'center', gap: 7,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => { if (newFolderName.trim()) e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <FolderPlus size={15} />
              Create Folder
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Checkbox ───────────────────────────────────────────────────── */
function Checkbox({ checked, onChange, colors }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: 16, height: 16, borderRadius: 4,
        border: `2px solid ${checked ? '#3b82f6' : (colors ? colors.borderDashed : '#cbd5e1')}`,
        background: checked ? '#3b82f6' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
      }}
    >
      {checked && <Check size={10} color="#fff" strokeWidth={3} />}
    </div>
  );
}
