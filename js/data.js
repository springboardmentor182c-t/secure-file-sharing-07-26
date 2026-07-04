// ===== TrustShare Mock Data Store =====

const TS = {
  // ===== App State =====
  state: {
    currentUser: null,
    currentPage: 'landing',
    currentFolder: 'root',
    viewMode: 'list',      // 'list' | 'grid'
    selectedFiles: new Set(),
    searchQuery: '',
    notifications: [],
    uploadQueue: [],
    sidebarOpen: false,
  },

  // ===== Users =====
  users: [
    {
      id: 'u1',
      name: 'Surya Venkatesh',
      email: 'surya@trustshare.io',
      role: 'Admin',
      avatar: 'SV',
      avatarColor: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
      plan: 'Enterprise',
      storageUsed: 47.3,
      storageTotal: 100,
      mfaEnabled: true,
      lastLogin: '2026-07-04T10:22:00Z',
      status: 'online',
      filesShared: 128,
      filesOwned: 342,
    },
    {
      id: 'u2',
      name: 'Priya Sharma',
      email: 'priya@acmecorp.com',
      role: 'Member',
      avatar: 'PS',
      avatarColor: 'linear-gradient(135deg,#10b981,#06b6d4)',
      plan: 'Team',
      storageUsed: 23.1,
      storageTotal: 50,
      mfaEnabled: true,
      lastLogin: '2026-07-04T09:15:00Z',
      status: 'online',
      filesShared: 45,
      filesOwned: 89,
    },
    {
      id: 'u3',
      name: 'Rahul Mehta',
      email: 'rahul@devteam.io',
      role: 'Member',
      avatar: 'RM',
      avatarColor: 'linear-gradient(135deg,#f59e0b,#f43f5e)',
      plan: 'Team',
      storageUsed: 8.7,
      storageTotal: 50,
      mfaEnabled: false,
      lastLogin: '2026-07-03T17:30:00Z',
      status: 'away',
      filesShared: 12,
      filesOwned: 34,
    },
    {
      id: 'u4',
      name: 'Ananya Krishnan',
      email: 'ananya@external.com',
      role: 'Guest',
      avatar: 'AK',
      avatarColor: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
      plan: 'Free',
      storageUsed: 1.2,
      storageTotal: 5,
      mfaEnabled: false,
      lastLogin: '2026-07-02T12:00:00Z',
      status: 'offline',
      filesShared: 2,
      filesOwned: 5,
    },
  ],

  // ===== Files & Folders =====
  files: [
    {
      id: 'f1', type: 'folder', name: 'Project Alpha', parent: 'root',
      icon: '📁', color: '#3b82f6', created: '2026-06-15', modified: '2026-07-03',
      owner: 'u1', shared: true, encrypted: true, size: null, itemCount: 12,
    },
    {
      id: 'f2', type: 'folder', name: 'Design Assets', parent: 'root',
      icon: '🎨', color: '#8b5cf6', created: '2026-06-20', modified: '2026-07-02',
      owner: 'u1', shared: false, encrypted: true, size: null, itemCount: 28,
    },
    {
      id: 'f3', type: 'folder', name: 'Legal Documents', parent: 'root',
      icon: '⚖️', color: '#f59e0b', created: '2026-05-10', modified: '2026-06-28',
      owner: 'u1', shared: true, encrypted: true, size: null, itemCount: 7,
    },
    {
      id: 'f4', type: 'file', name: 'Q2 Financial Report.pdf', parent: 'root',
      icon: '📄', color: '#f43f5e', created: '2026-07-01', modified: '2026-07-01',
      owner: 'u1', shared: true, encrypted: true, size: '4.2 MB', version: 3,
      hash: 'a3f2...d91c',
    },
    {
      id: 'f5', type: 'file', name: 'Architecture Diagram.png', parent: 'root',
      icon: '🖼️', color: '#10b981', created: '2026-06-28', modified: '2026-06-30',
      owner: 'u2', shared: false, encrypted: true, size: '2.8 MB', version: 1,
      hash: 'b7c4...e023',
    },
    {
      id: 'f6', type: 'file', name: 'Product Roadmap.xlsx', parent: 'root',
      icon: '📊', color: '#06b6d4', created: '2026-06-25', modified: '2026-07-04',
      owner: 'u1', shared: true, encrypted: true, size: '1.1 MB', version: 5,
      hash: 'c2a9...f17b',
    },
    {
      id: 'f7', type: 'file', name: 'Team Meeting Notes.docx', parent: 'root',
      icon: '📝', color: '#3b82f6', created: '2026-07-04', modified: '2026-07-04',
      owner: 'u3', shared: true, encrypted: false, size: '340 KB', version: 1,
      hash: 'd5e1...a88f',
    },
    {
      id: 'f8', type: 'file', name: 'Source Code v2.4.zip', parent: 'root',
      icon: '🗜️', color: '#8b5cf6', created: '2026-07-03', modified: '2026-07-03',
      owner: 'u1', shared: false, encrypted: true, size: '18.5 MB', version: 2,
      hash: 'e9b3...c44d',
    },
    {
      id: 'f9', type: 'file', name: 'Employee Contracts.pdf', parent: 'root',
      icon: '📋', color: '#f59e0b', created: '2026-06-01', modified: '2026-06-15',
      owner: 'u1', shared: false, encrypted: true, size: '6.7 MB', version: 1,
      hash: 'f1d7...b92e',
    },
    {
      id: 'f10', type: 'file', name: 'Marketing Video.mp4', parent: 'root',
      icon: '🎬', color: '#ec4899', created: '2026-06-30', modified: '2026-07-01',
      owner: 'u2', shared: true, encrypted: false, size: '124 MB', version: 1,
      hash: 'g8c5...a31b',
    },
  ],

  // ===== Shared Links =====
  sharedLinks: [
    {
      id: 'sl1', fileId: 'f4', fileName: 'Q2 Financial Report.pdf',
      link: 'https://trust.sh/s/Xk9pQ2r4mN',
      permissions: 'view', expiresAt: '2026-07-15', accessCount: 23,
      password: false, recipients: ['priya@acmecorp.com'],
      createdAt: '2026-07-01', status: 'active',
    },
    {
      id: 'sl2', fileId: 'f6', fileName: 'Product Roadmap.xlsx',
      link: 'https://trust.sh/s/Lm7rT9xWsA',
      permissions: 'edit', expiresAt: '2026-07-20', accessCount: 8,
      password: true, recipients: ['rahul@devteam.io', 'ananya@external.com'],
      createdAt: '2026-06-25', status: 'active',
    },
    {
      id: 'sl3', fileId: 'f1', fileName: 'Project Alpha',
      link: 'https://trust.sh/s/Bv3qK8nYpR',
      permissions: 'view', expiresAt: '2026-07-10', accessCount: 47,
      password: false, recipients: [],
      createdAt: '2026-06-15', status: 'active',
    },
    {
      id: 'sl4', fileId: 'f10', fileName: 'Marketing Video.mp4',
      link: 'https://trust.sh/s/Oc6jZ2wEqT',
      permissions: 'download', expiresAt: '2026-07-08', accessCount: 91,
      password: false, recipients: [],
      createdAt: '2026-06-30', status: 'expired',
    },
  ],

  // ===== Notifications =====
  notificationsData: [
    {
      id: 'n1', type: 'share', icon: '🔗', iconBg: 'rgba(59,130,246,0.15)', iconColor: '#60a5fa',
      title: 'File Shared with You',
      desc: 'Priya Sharma shared "Design Assets" folder with you with Editor access.',
      time: '2 min ago', timestamp: new Date(Date.now() - 120000),
      unread: true, category: 'shares',
    },
    {
      id: 'n2', type: 'security', icon: '🛡️', iconBg: 'rgba(16,185,129,0.15)', iconColor: '#34d399',
      title: 'New Login Detected',
      desc: 'Your account was accessed from a new device in Mumbai, India.',
      time: '1 hour ago', timestamp: new Date(Date.now() - 3600000),
      unread: true, category: 'security',
    },
    {
      id: 'n3', type: 'alert', icon: '⚠️', iconBg: 'rgba(245,158,11,0.15)', iconColor: '#fbbf24',
      title: 'Link Expiring Soon',
      desc: '"Marketing Video.mp4" shared link expires in 24 hours.',
      time: '3 hours ago', timestamp: new Date(Date.now() - 10800000),
      unread: true, category: 'shares',
    },
    {
      id: 'n4', type: 'upload', icon: '✅', iconBg: 'rgba(16,185,129,0.15)', iconColor: '#34d399',
      title: 'Upload Complete',
      desc: '"Source Code v2.4.zip" (18.5 MB) was encrypted and uploaded successfully.',
      time: '5 hours ago', timestamp: new Date(Date.now() - 18000000),
      unread: false, category: 'uploads',
    },
    {
      id: 'n5', type: 'access', icon: '👁️', iconBg: 'rgba(139,92,246,0.15)', iconColor: '#a78bfa',
      title: 'File Accessed',
      desc: 'Rahul Mehta viewed "Product Roadmap.xlsx" via shared link.',
      time: 'Yesterday', timestamp: new Date(Date.now() - 86400000),
      unread: false, category: 'activity',
    },
    {
      id: 'n6', type: 'security', icon: '🔐', iconBg: 'rgba(244,63,94,0.15)', iconColor: '#fb7185',
      title: 'MFA Reminder',
      desc: 'Enable two-factor authentication to secure your account.',
      time: 'Yesterday', timestamp: new Date(Date.now() - 90000000),
      unread: false, category: 'security',
    },
    {
      id: 'n7', type: 'download', icon: '⬇️', iconBg: 'rgba(6,182,212,0.15)', iconColor: '#22d3ee',
      title: 'File Downloaded',
      desc: 'Ananya Krishnan downloaded "Q2 Financial Report.pdf" via shared link.',
      time: '2 days ago', timestamp: new Date(Date.now() - 172800000),
      unread: false, category: 'activity',
    },
  ],

  // ===== Audit Log =====
  auditLog: [
    { id: 'a1', time: '17:22:04', event: '<strong>surya@trustshare.io</strong> uploaded "Source Code v2.4.zip"', level: 'info', levelClass: 'badge-blue' },
    { id: 'a2', time: '16:45:19', event: '<strong>priya@acmecorp.com</strong> accessed "Q2 Financial Report.pdf" via shared link', level: 'info', levelClass: 'badge-blue' },
    { id: 'a3', time: '15:30:07', event: 'Failed login attempt for <strong>unknown@hacker.ru</strong> — blocked by API Gateway', level: 'warn', levelClass: 'badge-amber' },
    { id: 'a4', time: '14:12:55', event: '<strong>surya@trustshare.io</strong> revoked link for "Employee Contracts.pdf"', level: 'warn', levelClass: 'badge-amber' },
    { id: 'a5', time: '13:08:31', event: '<strong>rahul@devteam.io</strong> logged in from new IP 203.194.x.x', level: 'info', levelClass: 'badge-blue' },
    { id: 'a6', time: '11:55:44', event: '<strong>ananya@external.com</strong> exceeded download quota — rate limited', level: 'error', levelClass: 'badge-rose' },
    { id: 'a7', time: '10:22:13', event: 'Encryption key rotation completed for vault <strong>#vault-007</strong>', level: 'success', levelClass: 'badge-emerald' },
    { id: 'a8', time: '09:15:02', event: '<strong>surya@trustshare.io</strong> created new folder "Legal Documents"', level: 'info', levelClass: 'badge-blue' },
  ],

  // ===== Activity Feed =====
  activityFeed: [
    { icon: '📤', bg: 'rgba(59,130,246,0.12)', color: '#60a5fa', text: '<strong>You</strong> uploaded "Source Code v2.4.zip"', time: '2 min ago' },
    { icon: '🔗', bg: 'rgba(139,92,246,0.12)', color: '#a78bfa', text: '<strong>Priya</strong> shared "Design Assets" with you', time: '1 hour ago' },
    { icon: '👁️', bg: 'rgba(16,185,129,0.12)', color: '#34d399', text: '<strong>Rahul</strong> viewed "Product Roadmap.xlsx"', time: '3 hours ago' },
    { icon: '⬇️', bg: 'rgba(6,182,212,0.12)', color: '#22d3ee', text: '<strong>Ananya</strong> downloaded "Q2 Financial Report.pdf"', time: 'Yesterday' },
    { icon: '✏️', bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', text: '<strong>You</strong> edited "Team Meeting Notes.docx"', time: '2 days ago' },
  ],

  // ===== Storage Breakdown =====
  storageData: {
    used: 47.3,
    total: 100,
    types: [
      { label: 'Documents', value: 18.2, color: '#3b82f6', emoji: '📄' },
      { label: 'Images', value: 12.4, color: '#8b5cf6', emoji: '🖼️' },
      { label: 'Videos', value: 9.8, color: '#ec4899', emoji: '🎬' },
      { label: 'Archives', value: 6.9, color: '#f59e0b', emoji: '🗜️' },
    ],
  },

  // ===== Analytics =====
  analyticsData: {
    uploadsByDay: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      data: [12, 19, 8, 24, 16, 5, 9],
    },
    accessByType: {
      labels: ['Views', 'Downloads', 'Edits', 'Shares'],
      data: [485, 212, 67, 38],
    },
    storageGrowth: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      data: [12, 18, 24, 29, 36, 43, 47.3],
    },
    userActivity: {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      data: [45, 62, 58, 71],
    },
  },

  // ===== Helper Methods =====
  getCurrentUser() {
    return this.state.currentUser || this.users[0];
  },

  getRootFiles() {
    return this.files.filter(f => f.parent === 'root');
  },

  getFileById(id) {
    return this.files.find(f => f.id === id);
  },

  getUnreadCount() {
    return this.notificationsData.filter(n => n.unread).length;
  },

  formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  generateShareLink() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    return `https://trust.sh/s/${result}`;
  },

  fileTypeColor: {
    'pdf': '#f43f5e', 'doc': '#3b82f6', 'docx': '#3b82f6',
    'xls': '#10b981', 'xlsx': '#10b981', 'ppt': '#f59e0b', 'pptx': '#f59e0b',
    'png': '#8b5cf6', 'jpg': '#8b5cf6', 'jpeg': '#8b5cf6',
    'mp4': '#ec4899', 'mov': '#ec4899',
    'zip': '#6b7280', 'rar': '#6b7280',
    'folder': '#3b82f6',
  },
};

window.TS = TS;
