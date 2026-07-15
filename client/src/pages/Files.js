import React, { useState, useRef } from 'react';
import {
  LayoutDashboard, Files as FilesIcon, FolderOpen, Users, Clock, Star, Trash2,
  Tag, GitBranch, Database, ChevronDown, Upload, X, Check,
  Search, Filter, Plus, FolderPlus, Download, Link2, MoreHorizontal,
  Edit3, RefreshCw, Folder, FileText, Image, Video, Presentation,
  FileSpreadsheet, MoreVertical, ArrowRight, Bell, HelpCircle, Grid
} from 'lucide-react';
import { useAnalytics } from '../context/AnalyticsContext';

/* ─── Static mock data ─────────────────────────────────────────── */

const CATEGORIES = [
  { name: 'Documents',     color: '#3b82f6', count: 152, icon: FileText },
  { name: 'Images',        color: '#f59e0b', count: 342, icon: Image },
  { name: 'Videos',        color: '#ef4444', count: 78,  icon: Video },
  { name: 'Presentations', color: '#8b5cf6', count: 64,  icon: Presentation },
  { name: 'Spreadsheets',  color: '#10b981', count: 98,  icon: FileSpreadsheet },
  { name: 'Contracts',     color: '#ec4899', count: 45,  icon: FileText },
  { name: 'Reports',       color: '#14b8a6', count: 67,  icon: FileText },
  { name: 'Other',         color: '#94a3b8', count: 23,  icon: FileText },
];

const FOLDERS = [
  { name: '2024 Projects',     items: 12, modified: '10 May 2024' },
  { name: 'Client Documents',  items: 28, modified: '08 May 2024' },
  { name: 'Marketing',         items: 15, modified: '06 May 2024' },
  { name: 'Financial Reports', items: 32, modified: '05 May 2024' },
  { name: 'HR Department',     items: 9,  modified: '02 May 2024' },
  { name: 'Archive',           items: 23, modified: '28 Apr 2024' },
];

const SEARCH_RESULTS = [
  { name: 'Q2 Financial Report.pdf',    category: 'Reports',       type: 'PDF',  size: '4.8 MB', modified: '10 May 2024', color: '#ef4444' },
  { name: 'Project Proposal.docx',      category: 'Documents',     type: 'DOCX', size: '2.1 MB', modified: '09 May 2024', color: '#3b82f6' },
  { name: 'Budget Plan.xlsx',           category: 'Spreadsheets',  type: 'XLSX', size: '1.6 MB', modified: '08 May 2024', color: '#10b981' },
  { name: 'Marketing Strategy.pptx',   category: 'Presentations', type: 'PPTX', size: '5.3 MB', modified: '06 May 2024', color: '#8b5cf6' },
  { name: 'Company Logo.png',           category: 'Images',        type: 'PNG',  size: '1.2 MB', modified: '06 May 2024', color: '#f59e0b' },
];

const VERSIONS = [
  { version: 'v3.0', current: true,  uploader: 'Jane Cooper', date: '10 May 2024, 10:30 AM', size: '4.8 MB', changes: 'Updated financial data.' },
  { version: 'v2.0', current: false, uploader: 'Jane Cooper', date: '08 May 2024, 11:20 AM', size: '4.5 MB', changes: 'Added Q2 analysis.' },
  { version: 'v1.0', current: false, uploader: 'John Smith',  date: '01 May 2024, 09:15 AM', size: '4.2 MB', changes: 'Initial version.' },
];

const TAGS = ['financial', 'quarterly', 'report'];

const UPLOAD_ITEMS = [
  { name: 'Q2 Financial Report.pdf',  size: '2.4 MB / 4.8 MB', pct: 50,  done: false, color: '#ef4444' },
  { name: 'Project Proposal.docx',    size: '12 MB / 12 MB',    pct: 100, done: true,  color: '#3b82f6' },
  { name: 'Budget Plan.xlsx',         size: '3.6 MB / 3.6 MB',  pct: 100, done: true,  color: '#10b981' },
];

const NAV_TOP = [
  { label: 'Dashboard',     icon: LayoutDashboard, to: '/' },
  { label: 'Files',         icon: FilesIcon,       to: '/files', active: true },
  { label: 'Folders',       icon: FolderOpen,      to: '/files' },
  { label: 'Shared with me',icon: Users,           to: '/files' },
  { label: 'Recent',        icon: Clock,           to: '/files' },
  { label: 'Favorites',     icon: Star,            to: '/files' },
  { label: 'Trash',         icon: Trash2,          to: '/files' },
];

const NAV_MGMT = [
  { label: 'File Categories', icon: Tag },
  { label: 'File Tags',       icon: Tag },
  { label: 'File Versions',   icon: GitBranch },
  { label: 'Metadata',        icon: Database },
];

/* ─── Tiny helpers ─────────────────────────────────────────────── */

function ExtBadge({ type, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 30, height: 30, borderRadius: 6,
      background: color + '22', color, fontSize: '0.58rem', fontWeight: 700,
      flexShrink: 0
    }}>{type}</span>
  );
}

function FolderBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 26, height: 26, borderRadius: 5,
      background: '#fef3c7', color: '#f59e0b', flexShrink: 0
    }}>
      <Folder size={15} fill="#fbbf24" />
    </span>
  );
}

function SectionCard({ number, title, children, style = {} }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 10,
      padding: '14px',
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      ...style
    }}>
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 7, margin: 0 }}>
        <span style={{
          width: 18, height: 18, borderRadius: '50%',
          background: '#3b82f6', color: '#fff',
          fontSize: '0.62rem', fontWeight: 800,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>{number}</span>
        {title}
      </h3>
      {children}
    </div>
  );
}

function IconBtn({ icon: Icon, size = 16, onClick, title, color }) {
  return (
    <button type="button" title={title} onClick={onClick} style={{
      background: 'transparent', border: 'none', cursor: 'pointer',
      color: color || '#64748b', padding: '6px',
      borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background 0.15s, color 0.15s'
    }}
      onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color || '#64748b'; }}
    >
      <Icon size={size} />
    </button>
  );
}

/* ─── Inner Sidebar ────────────────────────────────────────────── */

function FileSidebar({ user }) {
  return (
    <aside style={{
      width: 190, minWidth: 190, background: '#1a2035',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column',
      height: '100%', padding: '14px 8px', gap: 0, flexShrink: 0
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingLeft: 6, marginBottom: 18 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          background: 'linear-gradient(135deg,#3b82f6,#2563eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <FilesIcon size={16} color="#fff" />
        </div>
        <span style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1rem', color: '#fff' }}>FileHub</span>
      </div>

      {/* Top nav */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
        {NAV_TOP.map(({ label, icon: Icon, active }) => (
          <button key={label} type="button" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: active ? '#3b82f6' : 'transparent',
            color: active ? '#ffffff' : '#94a3b8',
            fontWeight: active ? 600 : 400, fontSize: '0.8rem',
            width: '100%', textAlign: 'left', transition: 'all 0.15s'
          }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e2e8f0'; } }}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}

        {/* Management section */}
        <div style={{ marginTop: 12, marginBottom: 4, paddingLeft: 10, fontSize: '0.62rem', fontWeight: 700, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Management
        </div>
        {NAV_MGMT.map(({ label, icon: Icon }) => (
          <button key={label} type="button" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 10px', borderRadius: 7, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#64748b',
            fontWeight: 400, fontSize: '0.8rem',
            width: '100%', textAlign: 'left', transition: 'all 0.15s'
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e2e8f0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* Storage */}
      <div style={{ padding: '10px 8px', marginTop: 'auto' }}>
        <div style={{ marginBottom: 2, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Storage</span>
        </div>
        <span style={{ fontSize: '0.65rem', color: '#64748b', display: 'block', marginBottom: 5 }}>128.4 GB / 500 GB</span>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: '25.68%', height: '100%', background: 'linear-gradient(90deg,#3b82f6,#2563eb)', borderRadius: 99 }} />
        </div>
        <span style={{ fontSize: '0.62rem', color: '#3b82f6', marginTop: 3, display: 'block' }}>25.68%</span>
      </div>

      {/* User */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 12, paddingLeft: 8, paddingRight: 8,
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg,#a78bfa,#ec4899)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
        }}>
          {(user?.full_name || user?.email || 'J').charAt(0).toUpperCase()}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.full_name || 'Jane Cooper'}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email || 'jane.cooper@filehub.com'}
          </div>
        </div>
        <ChevronDown size={14} color="#64748b" style={{ marginLeft: 'auto', flexShrink: 0 }} />
      </div>
    </aside>
  );
}

/* ─── Panel 1: Secure File Upload ──────────────────────────────── */

function UploadPanel() {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  return (
    <SectionCard number="1" title="Secure File Upload">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); }}
        style={{
          border: `2px dashed ${dragging ? '#3b82f6' : '#e2e8f0'}`,
          borderRadius: 10, padding: '14px 12px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          background: dragging ? 'rgba(59,130,246,0.05)' : '#f8fafc',
          transition: 'all 0.2s', cursor: 'pointer'
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(59,130,246,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Upload size={20} color="#3b82f6" />
        </div>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b' }}>Drag &amp; drop files here</span>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>or</span>
        <button type="button" onClick={e => { e.stopPropagation(); inputRef.current?.click(); }} style={{
          padding: '6px 18px', borderRadius: 7,
          background: '#3b82f6',
          color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer'
        }}>Browse Files</button>
        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center' }}>
          Max 2 GB · JPG, PNG, PDF, DOCX, XLSX, PPTX, ZIP
        </span>
        <input ref={inputRef} type="file" multiple style={{ display: 'none' }} />
      </div>

      {/* Progress items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {UPLOAD_ITEMS.map((f, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ExtBadge type={f.name.split('.').pop().toUpperCase()} color={f.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
              <div style={{ fontSize: '0.65rem', color: '#94a3b8', marginBottom: 3 }}>{f.size}</div>
              <div style={{ height: 4, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  width: `${f.pct}%`, height: '100%', borderRadius: 99,
                  background: f.pct === 100 ? '#10b981' : '#3b82f6',
                  transition: 'width 0.6s'
                }} />
              </div>
            </div>
            {f.pct === 100
              ? <Check size={13} color="#10b981" />
              : <IconBtn icon={X} size={12} />
            }
          </div>
        ))}
      </div>

      <button type="button" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5, padding: 0
      }}>
        View all uploads <ArrowRight size={12} />
      </button>
    </SectionCard>
  );
}

/* ─── Panel 2: File Categorization ─────────────────────────────── */

function CategorizationPanel() {
  return (
    <SectionCard number="2" title="File Categorization">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: '#475569', fontWeight: 600 }}>Categories</span>
        <button type="button" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px', borderRadius: 7,
          border: '1px solid #e2e8f0',
          background: 'transparent', color: '#1e293b',
          fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
        }}>
          <Plus size={13} /> New Category
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {CATEGORIES.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 3px', borderBottom: i < CATEGORIES.length - 1 ? '1px solid #f1f5f9' : 'none',
              cursor: 'pointer', borderRadius: 4
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <span style={{
                width: 22, height: 22, borderRadius: 5,
                background: cat.color + '22', color: cat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Icon size={12} />
              </span>
              <span style={{ flex: 1, fontSize: '0.78rem', color: '#1e293b', fontWeight: 500 }}>{cat.name}</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{cat.count} files</span>
            </div>
          );
        })}
      </div>

      <button type="button" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#3b82f6', fontSize: '0.73rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5, padding: 0
      }}>
        Manage Categories <ArrowRight size={12} />
      </button>
    </SectionCard>
  );
}

/* ─── Panel 3: Folder Management ───────────────────────────────── */

function FolderPanel() {
  return (
    <SectionCard number="3" title="Folder Management">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <button type="button" style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 8,
          background: '#3b82f6',
          color: '#fff', border: 'none', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer'
        }}>
          <FolderPlus size={14} /> New Folder
        </button>
        <div style={{ display: 'flex', gap: 4 }}>
          <IconBtn icon={Download} size={16} title="Export" />
          <IconBtn icon={Link2} size={16} title="Share Link" />
          <IconBtn icon={MoreHorizontal} size={16} title="More" />
        </div>
      </div>

      {/* My Files breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: '#64748b' }}>
        <Folder size={13} />
        <span>My Files</span>
      </div>

      {/* Table header */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 52px 78px 44px', gap: 4, paddingBottom: 6, borderBottom: '1px solid #e2e8f0' }}>
        {['Name', 'Type', 'Items', 'Modified', ''].map(h => (
          <span key={h} style={{ fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      {FOLDERS.map((f, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: '1fr 56px 52px 78px 44px', gap: 4,
          padding: '5px 0', borderBottom: i < FOLDERS.length - 1 ? '1px solid #f1f5f9' : 'none',
          alignItems: 'center'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FolderBadge />
            <span style={{ fontSize: '0.74rem', fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
          </div>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Folder</span>
          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>{f.items}</span>
          <span style={{ fontSize: '0.67rem', color: '#94a3b8' }}>{f.modified}</span>
          <IconBtn icon={MoreHorizontal} size={12} />
        </div>
      ))}

      <button type="button" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#3b82f6', fontSize: '0.73rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5, padding: 0
      }}>
        View all folders <ArrowRight size={12} />
      </button>
    </SectionCard>
  );
}

/* ─── Panel 4: File Search & Filtering ─────────────────────────── */

function SearchPanel() {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [catFilter, setCatFilter] = useState('All');

  const results = SEARCH_RESULTS.filter(f =>
    f.name.toLowerCase().includes(query.toLowerCase()) ||
    f.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <SectionCard number="4" title="File Search & Filtering" style={{ gridColumn: 'span 2' }}>
      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder="Search files by name, type, tags..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              paddingLeft: 34, fontSize: '0.82rem', width: '100%', borderRadius: 8,
              border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b',
              padding: '7px 12px 7px 34px', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <IconBtn icon={Filter} size={16} title="More filters" />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { label: 'Type', value: typeFilter, setter: setTypeFilter, opts: ['All', 'PDF', 'DOCX', 'XLSX', 'PPTX', 'PNG'] },
            { label: 'Category', value: catFilter, setter: setCatFilter, opts: ['All', 'Reports', 'Documents', 'Spreadsheets', 'Presentations', 'Images'] },
          ].map(({ label, value, setter, opts }) => (
            <select key={label} value={value} onChange={e => setter(e.target.value)} style={{
              fontSize: '0.78rem', padding: '6px 10px', borderRadius: 8, cursor: 'pointer', minWidth: 110,
              border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', outline: 'none'
            }}>
              {opts.map(o => <option key={o} value={o}>{label}: {o}</option>)}
            </select>
          ))}
          <button type="button" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: 'transparent', color: '#475569', fontSize: '0.78rem', cursor: 'pointer'
          }}>
            Date Modified <ChevronDown size={12} />
          </button>
          <button type="button" style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0',
            background: 'transparent', color: '#475569', fontSize: '0.78rem', cursor: 'pointer'
          }}>
            + More Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              {['Name', 'Category', 'Type', 'Size', 'Modified'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '5px 6px', fontSize: '0.62rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((f, i) => (
              <tr key={i}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                style={{ cursor: 'pointer' }}
              >
                <td style={{ padding: '5px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <ExtBadge type={f.type} color={f.color} />
                  <span style={{ fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{f.name}</span>
                </td>
                <td style={{ padding: '5px 6px', color: '#475569' }}>{f.category}</td>
                <td style={{ padding: '5px 6px', color: '#475569' }}>{f.type}</td>
                <td style={{ padding: '5px 6px', color: '#475569' }}>{f.size}</td>
                <td style={{ padding: '5px 6px', color: '#94a3b8' }}>{f.modified}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#3b82f6', fontSize: '0.73rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5, padding: 0
      }}>
        View all results <ArrowRight size={12} />
      </button>
    </SectionCard>
  );
}

/* ─── Panel 5: File Version Management ─────────────────────────── */

function VersionPanel() {
  return (
    <SectionCard number="5" title="File Version Management">
      {/* File header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <ExtBadge type="PDF" color="#ef4444" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1e293b' }}>Q2 Financial Report.pdf</div>
            <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>/ Reports / 2024</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <button type="button" style={{
            padding: '5px 10px', borderRadius: 7,
            background: '#3b82f6',
            color: '#fff', border: 'none', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
            whiteSpace: 'nowrap'
          }}>
            Upload New Version
          </button>
          <IconBtn icon={MoreVertical} size={13} />
        </div>
      </div>

      {/* Version table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
          <thead>
            <tr>
              {['Version', 'Uploaded By', 'Date', 'Size', 'Changes', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '5px 6px', fontSize: '0.6rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VERSIONS.map((v, i) => (
              <tr key={i}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '5px 6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{v.version}</span>
                    {v.current && (
                      <span style={{
                        padding: '1px 6px', borderRadius: 99, fontSize: '0.58rem', fontWeight: 700,
                        background: 'rgba(59,130,246,0.12)', color: '#3b82f6'
                      }}>Current</span>
                    )}
                  </div>
                </td>
                <td style={{ padding: '5px 6px', color: '#475569', whiteSpace: 'nowrap' }}>{v.uploader}</td>
                <td style={{ padding: '5px 6px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{v.date}</td>
                <td style={{ padding: '5px 6px', color: '#475569', whiteSpace: 'nowrap' }}>{v.size}</td>
                <td style={{ padding: '5px 6px', color: '#475569', maxWidth: 130 }}>{v.changes}</td>
                <td style={{ padding: '5px 6px' }}>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <IconBtn icon={Download} size={12} title="Download" />
                    <IconBtn icon={RefreshCw} size={12} title="Restore" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button type="button" style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: '#3b82f6', fontSize: '0.73rem', fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 5, padding: 0
      }}>
        View version history <ArrowRight size={12} />
      </button>
    </SectionCard>
  );
}

/* ─── Panel 6: File Metadata Management ────────────────────────── */

function MetadataPanel() {
  const [tags, setTags] = useState(TAGS);
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !tags.includes(t)) { setTags([...tags, t]); setNewTag(''); }
  };

  return (
    <SectionCard number="6" title="File Metadata Management">
      {/* File header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <ExtBadge type="PDF" color="#ef4444" />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.78rem', color: '#1e293b' }}>Q2 Financial Report.pdf</div>
            <div style={{ fontSize: '0.67rem', color: '#94a3b8' }}>/ Reports / 2024</div>
          </div>
        </div>
        <button type="button" style={{
          padding: '5px 10px', borderRadius: 7,
          border: '1px solid #e2e8f0',
          background: '#ffffff', color: '#1e293b',
          fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4
        }}>
          <Edit3 size={11} /> Edit Metadata
        </button>
      </div>

      {/* Field rows */}
      {[
        { label: 'File Name',    value: 'Q2 Financial Report.pdf' },
        { label: 'File Type',    value: 'PDF' },
        { label: 'Category',     value: 'Reports' },
        { label: 'Size',         value: '4.8 MB' },
        { label: 'Uploaded By',  value: 'Jane Cooper' },
        { label: 'Uploaded On',  value: '10 May 2024, 10:30 AM' },
      ].map(({ label, value }) => (
        <div key={label} style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: 6, alignItems: 'start' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>{label}</span>
          <span style={{ fontSize: '0.73rem', color: '#1e293b' }}>{value}</span>
        </div>
      ))}

      {/* Tags */}
      <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: 6, alignItems: 'start' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>Tags</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          {tags.map(t => (
            <span key={t} style={{
              padding: '2px 7px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 600,
              background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
              display: 'flex', alignItems: 'center', gap: 3
            }}>
              {t}
              <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#3b82f6', lineHeight: 1
              }}><X size={9} /></button>
            </span>
          ))}
          <input
            type="text"
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            placeholder="+ Add Tag"
            style={{
              padding: '2px 6px', fontSize: '0.65rem', borderRadius: 99, width: 70, minWidth: 0,
              border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b', outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Description */}
      <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: 6, alignItems: 'start' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>Description</span>
        <span style={{ fontSize: '0.73rem', color: '#475569', lineHeight: 1.4 }}>
          Quarterly financial performance report for Q2 2024.
        </span>
      </div>

      {/* Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '85px 1fr', gap: 6, alignItems: 'start' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8' }}>Status</span>
        <span style={{
          padding: '2px 8px', borderRadius: 99, fontSize: '0.65rem', fontWeight: 700,
          background: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'inline-flex', width: 'fit-content'
        }}>Active</span>
      </div>
    </SectionCard>
  );
}

/* ─── Top Toolbar ───────────────────────────────────────────────── */

function FileTopBar({ user }) {
  return (
    <div style={{
      height: 50, background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 18px', gap: 12, flexShrink: 0
    }}>
      <div>
        <div style={{ fontFamily: 'var(--font-title)', fontWeight: 800, fontSize: '1rem', color: '#1e293b' }}>File Management</div>
        <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Securely manage, organize and access your files</div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
        <input
          type="text"
          placeholder="Search files, folders, tags…"
          style={{
            paddingLeft: 36, paddingRight: 40, fontSize: '0.82rem', width: '100%', borderRadius: 99,
            border: '1px solid #e2e8f0', background: '#f8fafc', color: '#1e293b',
            padding: '7px 40px 7px 36px', outline: 'none', boxSizing: 'border-box'
          }}
        />
        <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.65rem', color: '#94a3b8', background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, border: '1px solid #e2e8f0' }}>⌘K</span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
        ><HelpCircle size={18} /></button>
        <div style={{ position: 'relative' }}>
          <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
          ><Bell size={18} /></button>
          <span style={{
            position: 'absolute', top: 2, right: 2, width: 8, height: 8,
            borderRadius: '50%', background: '#ef4444', border: '2px solid #ffffff'
          }} />
        </div>
        <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '6px', borderRadius: 6, display: 'flex', alignItems: 'center' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#1e293b'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748b'; }}
        ><Grid size={18} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderLeft: '1px solid #e2e8f0', paddingLeft: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg,#a78bfa,#ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.85rem'
          }}>
            {(user?.full_name || 'J').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1e293b', lineHeight: 1.2 }}>{user?.full_name || 'Jane Cooper'}</div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Admin</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────────────── */

export default function Files() {
  const { user } = useAnalytics();

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      background: '#f0f4f8', fontFamily: 'var(--font-body)',
      width: '100%'
    }}>
      <FileSidebar user={user} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <FileTopBar user={user} />

        {/* Main scrollable grid */}
        <div style={{
          flex: 1, overflowY: 'auto', overflowX: 'hidden',
          padding: '12px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridAutoRows: 'auto',
          gap: 12,
          alignContent: 'start',
          background: '#f0f4f8'
        }}>
          {/* Row 1 */}
          <UploadPanel />
          <CategorizationPanel />
          <FolderPanel />

          {/* Row 2 */}
          <SearchPanel />          {/* spans 2 cols */}
          <VersionPanel />
          <MetadataPanel />
        </div>
      </div>
    </div>
  );
}
