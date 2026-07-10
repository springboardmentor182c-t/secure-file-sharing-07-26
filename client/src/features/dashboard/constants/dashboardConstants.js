export const DASHBOARD_THEME = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#315BFF',
  primaryDark: '#3B22E8',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#2563EB',
};

export const CARD_BASE_CLASS =
  'rounded-[18px] border border-[#E2E8F0] bg-white shadow-sm transition hover:shadow-soft';

export const FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315BFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid', active: true },
  { id: 'my-files', label: 'My Files', icon: 'file' },
  { id: 'shared', label: 'Shared with Me', icon: 'share', badge: '4' },
  { id: 'activity', label: 'Activity', icon: 'pulse' },
  { id: 'notifications', label: 'Notifications', icon: 'bell', badge: '12' },
  { id: 'analytics', label: 'Analytics', icon: 'chart' },
  { id: 'admin', label: 'Admin', icon: 'shield' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
];

export const DASHBOARD_QUICK_ACTIONS = [
  { id: 'upload-file', label: 'Upload File', description: 'Add a secure file', icon: 'upload' },
  { id: 'create-folder', label: 'Create Folder', description: 'Organize documents', icon: 'folder' },
  { id: 'share-file', label: 'Share File', description: 'Send protected access', icon: 'share' },
  { id: 'view-recent', label: 'View Recent', description: 'Open latest activity', icon: 'clock' },
];

export const FILE_TYPE_COLORS = ['#315BFF', '#8B5CF6', '#FBBF24', '#2DD4BF', '#EF4444'];

export const STATUS_BADGE_STYLES = {
  Encrypted: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Shared: 'bg-blue-50 text-blue-700 ring-blue-100',
  Private: 'bg-slate-100 text-slate-700 ring-slate-200',
  'Pending Review': 'bg-amber-50 text-amber-700 ring-amber-100',
};
