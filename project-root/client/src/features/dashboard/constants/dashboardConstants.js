export const DASHBOARD_THEME = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  primary: '#4F46E5',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',
  info: '#2563EB',
};

export const CARD_BASE_CLASS = 'rounded-lg border border-[#E2E8F0] bg-white shadow-sm';

export const FOCUS_RING_CLASS =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F8FAFC]';

export const DASHBOARD_QUICK_ACTIONS = [
  {
    id: 'upload-file',
    label: 'Upload File',
    description: 'Add a secure document',
    icon: 'upload',
    ariaLabel: 'Upload a secure file',
  },
  {
    id: 'create-folder',
    label: 'Create Folder',
    description: 'Organize encrypted files',
    icon: 'folder',
    ariaLabel: 'Create a new folder',
  },
  {
    id: 'share-file',
    label: 'Share File',
    description: 'Send protected access',
    icon: 'share',
    ariaLabel: 'Share a file securely',
  },
  {
    id: 'recent-files',
    label: 'View Recent Files',
    description: 'Open latest changes',
    icon: 'clock',
    ariaLabel: 'View recent files',
  },
];

export const STATUS_BADGE_STYLES = {
  Encrypted: 'bg-green-50 text-[#16A34A] ring-green-100',
  Shared: 'bg-indigo-50 text-[#4F46E5] ring-indigo-100',
  Private: 'bg-slate-100 text-[#0F172A] ring-slate-200',
  'Pending Review': 'bg-amber-50 text-[#F59E0B] ring-amber-100',
};

export const STAT_TONE_STYLES = {
  primary: {
    icon: 'bg-indigo-50 text-[#4F46E5]',
    trend: 'text-[#16A34A] bg-green-50',
  },
  success: {
    icon: 'bg-green-50 text-[#16A34A]',
    trend: 'text-[#16A34A] bg-green-50',
  },
  warning: {
    icon: 'bg-amber-50 text-[#F59E0B]',
    trend: 'text-[#F59E0B] bg-amber-50',
  },
  danger: {
    icon: 'bg-red-50 text-[#DC2626]',
    trend: 'text-[#DC2626] bg-red-50',
  },
  info: {
    icon: 'bg-blue-50 text-[#2563EB]',
    trend: 'text-[#2563EB] bg-blue-50',
  },
};

export const ACTIVITY_TONE_STYLES = {
  upload: 'bg-blue-100 text-[#2563EB]',
  share: 'bg-indigo-100 text-[#4F46E5]',
  security: 'bg-green-100 text-[#16A34A]',
  admin: 'bg-amber-100 text-[#F59E0B]',
  expired: 'bg-slate-100 text-[#64748B]',
};

export const NOTIFICATION_TONE_STYLES = {
  share: 'bg-indigo-50 text-[#4F46E5]',
  warning: 'bg-amber-50 text-[#F59E0B]',
  security: 'bg-green-50 text-[#16A34A]',
  info: 'bg-blue-50 text-[#2563EB]',
};

export const FILE_TYPE_COLORS = ['#4F46E5', '#2563EB', '#16A34A', '#F59E0B', '#DC2626'];
