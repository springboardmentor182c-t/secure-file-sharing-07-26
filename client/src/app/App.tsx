import { useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ProtectedRoute, GuestOnlyRoute } from "./components/ProtectedRoute";
import Landing from "./features/auth/Landing";
import SignIn from "./features/auth/SignIn";
import SignUp from "./features/auth/SignUp";
import MFAVerify from "./features/auth/MFAVerify";
import ForgotPassword from "./features/auth/ForgotPassword";
import ResetPassword from "./features/auth/ResetPassword";
import {
  Shield,
  Share2,
  Clock,
  Star,
  Trash2,
  BarChart3,
  Bell,
  Settings,
  Upload,
  Search,
  MoreHorizontal,
  Download,
  Link,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  X,
  LogOut,
  File,
  FileText,
  FileImage,
  Archive,
  ArrowRight,
  AlertTriangle,
  ChevronDown,
  Lock,
  Activity,
  Filter,
  Check,
  HardDrive,
  Globe,
  Copy,
  Eye,
  TrendingUp,
  Zap,
  RefreshCw,
  AlertCircle,
  Folder,
  FolderOpen,
  Tag,
  History,
  Info,
  Server,
  Key,
  Smartphone,
  Mail,
  UserPlus,
  UserCheck,
  Ban,
  ShieldAlert,
  ShieldCheck,
  Database,
  Cpu,
  Wifi,
  ChevronRight,
  RotateCcw,
  EyeOff,
  FileSearch,
  BarChart2,
  PieChart,
  UserX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart as RechartsPie,
  Pie,
  Cell,
} from "recharts";

// ─── Types ─────────────────────────────────────────────────────────────────────
type AppTab =
  | "files"
  | "shared"
  | "recent"
  | "starred"
  | "trash"
  | "shares"
  | "analytics"
  | "auditlog"
  | "security"
  | "notifications"
  | "settings"
  | "admin";

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const FILES_DATA = [
  {
    id: 1,
    name: "Q4-Financial-Report.pdf",
    type: "pdf",
    size: "2.4 MB",
    modified: "Jan 15, 2024",
    owner: "Alex Chen",
    shared: true,
    starred: true,
    downloads: 23,
    category: "Finance",
    encrypted: true,
    versions: 3,
  },
  {
    id: 2,
    name: "Design-Assets-2024.zip",
    type: "zip",
    size: "48.2 MB",
    modified: "Jan 14, 2024",
    owner: "Sarah Kim",
    shared: true,
    starred: false,
    downloads: 7,
    category: "Design",
    encrypted: true,
    versions: 1,
  },
  {
    id: 3,
    name: "Team-Photo-Q4.jpg",
    type: "image",
    size: "3.8 MB",
    modified: "Jan 13, 2024",
    owner: "You",
    shared: false,
    starred: false,
    downloads: 0,
    category: "Media",
    encrypted: true,
    versions: 1,
  },
  {
    id: 4,
    name: "Product-Roadmap-2024.docx",
    type: "doc",
    size: "892 KB",
    modified: "Jan 12, 2024",
    owner: "You",
    shared: true,
    starred: true,
    downloads: 45,
    category: "Engineering",
    encrypted: true,
    versions: 4,
  },
  {
    id: 5,
    name: "Database-Backup-Jan.sql",
    type: "file",
    size: "156 MB",
    modified: "Jan 11, 2024",
    owner: "Mike Torres",
    shared: false,
    starred: false,
    downloads: 2,
    category: "Engineering",
    encrypted: true,
    versions: 2,
  },
  {
    id: 6,
    name: "Marketing-Deck-Q1.pptx",
    type: "doc",
    size: "12.1 MB",
    modified: "Jan 10, 2024",
    owner: "Emily Walsh",
    shared: true,
    starred: false,
    downloads: 18,
    category: "Marketing",
    encrypted: true,
    versions: 2,
  },
  {
    id: 7,
    name: "Source-Code-v2.tar.gz",
    type: "zip",
    size: "234 MB",
    modified: "Jan 09, 2024",
    owner: "You",
    shared: false,
    starred: true,
    downloads: 3,
    category: "Engineering",
    encrypted: true,
    versions: 5,
  },
  {
    id: 8,
    name: "Legal-Contracts-2024.pdf",
    type: "pdf",
    size: "1.2 MB",
    modified: "Jan 08, 2024",
    owner: "Jordan Lee",
    shared: true,
    starred: true,
    downloads: 9,
    category: "Legal",
    encrypted: true,
    versions: 2,
  },
];

const FOLDERS_DATA = [
  {
    id: 1,
    name: "Finance",
    files: 12,
    size: "45 MB",
    color: "#60A5FA",
  },
  {
    id: 2,
    name: "Legal",
    files: 8,
    size: "23 MB",
    color: "#F59E0B",
  },
  {
    id: 3,
    name: "Design",
    files: 34,
    size: "1.2 GB",
    color: "#B7A2C9",
  },
  {
    id: 4,
    name: "Engineering",
    files: 67,
    size: "3.4 GB",
    color: "#22C55E",
  },
  {
    id: 5,
    name: "Marketing",
    files: 19,
    size: "567 MB",
    color: "#F87171",
  },
];

const VERSIONS_DATA: Record<
  number,
  {
    version: string;
    date: string;
    size: string;
    user: string;
  }[]
> = {
  1: [
    {
      version: "v3.0 (current)",
      date: "Jan 15, 2024",
      size: "2.4 MB",
      user: "Alex Chen",
    },
    {
      version: "v2.1",
      date: "Jan 10, 2024",
      size: "2.2 MB",
      user: "Alex Chen",
    },
    {
      version: "v2.0",
      date: "Dec 28, 2023",
      size: "2.0 MB",
      user: "Sarah Kim",
    },
  ],
  4: [
    {
      version: "v4.0 (current)",
      date: "Jan 12, 2024",
      size: "892 KB",
      user: "You",
    },
    {
      version: "v3.2",
      date: "Jan 7, 2024",
      size: "834 KB",
      user: "You",
    },
    {
      version: "v3.0",
      date: "Jan 5, 2024",
      size: "756 KB",
      user: "You",
    },
    {
      version: "v2.0",
      date: "Dec 20, 2023",
      size: "612 KB",
      user: "Emily Walsh",
    },
  ],
  7: [
    {
      version: "v5.0 (current)",
      date: "Jan 9, 2024",
      size: "234 MB",
      user: "You",
    },
    {
      version: "v4.1",
      date: "Jan 3, 2024",
      size: "198 MB",
      user: "You",
    },
    {
      version: "v4.0",
      date: "Dec 22, 2023",
      size: "189 MB",
      user: "You",
    },
  ],
};

const AUDIT_DATA = [
  {
    id: 1,
    ts: "2024-01-15 14:32:01",
    user: "alex@acme.com",
    action: "File Downloaded",
    file: "Q4-Financial-Report.pdf",
    ip: "192.168.1.45",
    status: "success",
    suspicious: false,
  },
  {
    id: 2,
    ts: "2024-01-15 14:28:17",
    user: "extern@mail.com",
    action: "Login Failed",
    file: "—",
    ip: "10.0.2.88",
    status: "failed",
    suspicious: false,
  },
  {
    id: 3,
    ts: "2024-01-15 13:55:44",
    user: "sarah@acme.com",
    action: "File Shared",
    file: "Design-Assets-2024.zip",
    ip: "192.168.1.22",
    status: "success",
    suspicious: false,
  },
  {
    id: 4,
    ts: "2024-01-15 13:41:30",
    user: "bot@spam.net",
    action: "API Abuse Attempt",
    file: "—",
    ip: "45.33.32.156",
    status: "failed",
    suspicious: true,
  },
  {
    id: 5,
    ts: "2024-01-15 12:18:09",
    user: "mike@acme.com",
    action: "File Uploaded",
    file: "Database-Backup-Jan.sql",
    ip: "192.168.1.33",
    status: "success",
    suspicious: false,
  },
  {
    id: 6,
    ts: "2024-01-15 11:55:22",
    user: "unknown",
    action: "Permission Changed",
    file: "Legal-Contracts.pdf",
    ip: "172.16.0.5",
    status: "warning",
    suspicious: true,
  },
  {
    id: 7,
    ts: "2024-01-15 10:30:45",
    user: "emily@acme.com",
    action: "File Deleted",
    file: "Old-Archive.zip",
    ip: "192.168.1.67",
    status: "success",
    suspicious: false,
  },
  {
    id: 8,
    ts: "2024-01-15 09:12:33",
    user: "system",
    action: "Backup Completed",
    file: "System Backup",
    ip: "127.0.0.1",
    status: "success",
    suspicious: false,
  },
  {
    id: 9,
    ts: "2024-01-15 08:45:01",
    user: "hacker@dark.net",
    action: "Brute Force Detected",
    file: "—",
    ip: "185.220.101.34",
    status: "failed",
    suspicious: true,
  },
  {
    id: 10,
    ts: "2024-01-14 17:22:18",
    user: "jordan@acme.com",
    action: "File Downloaded",
    file: "Legal-Contracts-2024.pdf",
    ip: "192.168.1.89",
    status: "success",
    suspicious: false,
  },
];

const NOTIFS_DATA = [
  {
    id: 1,
    type: "share",
    title: "Sarah Kim shared a file with you",
    desc: "Design-Assets-2024.zip · 48.2 MB",
    time: "5 min ago",
    read: false,
  },
  {
    id: 2,
    type: "download",
    title: "Your file was downloaded",
    desc: "Q4-Financial-Report.pdf downloaded by 3 users",
    time: "22 min ago",
    read: false,
  },
  {
    id: 3,
    type: "alert",
    title: "Security alert detected",
    desc: "Multiple failed logins from 45.33.32.156",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 4,
    type: "expiry",
    title: "Share link expiring soon",
    desc: "Marketing-Deck-Q1.pptx expires in 24 hours",
    time: "3 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "upload",
    title: "Upload complete",
    desc: "Source-Code-v2.tar.gz (234 MB) uploaded",
    time: "Yesterday",
    read: true,
  },
  {
    id: 6,
    type: "share",
    title: "Jordan Lee accepted your invite",
    desc: "Now has access to Legal-Contracts-2024.pdf",
    time: "Yesterday",
    read: true,
  },
  {
    id: 7,
    type: "alert",
    title: "Storage at 82%",
    desc: "You're using 410 GB of your 500 GB quota",
    time: "2 days ago",
    read: true,
  },
];

const SHARE_LINKS_DATA = [
  {
    id: 1,
    file: "Q4-Financial-Report.pdf",
    link: "trust.share/f/x7K2mN",
    created: "Jan 15",
    expires: "Jan 22, 2024",
    views: 12,
    downloads: 5,
    access: "View only",
    restrict: true,
    active: true,
  },
  {
    id: 2,
    file: "Design-Assets-2024.zip",
    link: "trust.share/f/p9QrXt",
    created: "Jan 14",
    expires: "Never",
    views: 34,
    downloads: 7,
    access: "Download",
    restrict: false,
    active: true,
  },
  {
    id: 3,
    file: "Product-Roadmap-2024.docx",
    link: "trust.share/f/m3NzWq",
    created: "Jan 12",
    expires: "Jan 26, 2024",
    views: 78,
    downloads: 45,
    access: "View only",
    restrict: true,
    active: true,
  },
  {
    id: 4,
    file: "Legal-Contracts-2024.pdf",
    link: "trust.share/f/k1JvYp",
    created: "Jan 8",
    expires: "Feb 8, 2024",
    views: 9,
    downloads: 0,
    access: "View only",
    restrict: true,
    active: false,
  },
];

const SESSIONS_DATA = [
  {
    id: 1,
    device: "Chrome 120 on macOS 14",
    location: "San Francisco, CA",
    ip: "192.168.1.45",
    lastActive: "Active now",
    current: true,
  },
  {
    id: 2,
    device: "Safari 17 on iPhone 15",
    location: "San Francisco, CA",
    ip: "192.168.1.67",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: 3,
    device: "Firefox 121 on Windows 11",
    location: "New York, NY",
    ip: "10.0.0.22",
    lastActive: "1 day ago",
    current: false,
  },
];

const SECURITY_EVENTS_DATA = [
  {
    id: 1,
    ts: "2024-01-15 14:28",
    event: "Brute Force Attack",
    source: "185.220.101.34",
    country: "RU",
    severity: "critical",
    blocked: true,
  },
  {
    id: 2,
    ts: "2024-01-15 14:10",
    event: "Multiple Failed Logins",
    source: "10.0.2.88",
    country: "US",
    severity: "high",
    blocked: true,
  },
  {
    id: 3,
    ts: "2024-01-15 13:41",
    event: "API Abuse Attempt",
    source: "45.33.32.156",
    country: "NL",
    severity: "high",
    blocked: true,
  },
  {
    id: 4,
    ts: "2024-01-15 11:55",
    event: "Unusual Permission Change",
    source: "172.16.0.5",
    country: "US",
    severity: "medium",
    blocked: false,
  },
  {
    id: 5,
    ts: "2024-01-14 09:22",
    event: "Suspicious Download Pattern",
    source: "192.168.1.99",
    country: "US",
    severity: "medium",
    blocked: false,
  },
  {
    id: 6,
    ts: "2024-01-13 16:45",
    event: "Geo-Anomaly Login",
    source: "91.108.4.0",
    country: "CN",
    severity: "low",
    blocked: false,
  },
];

const LOGIN_ATTEMPTS_DATA = [
  { hour: "00:00", success: 2, failed: 1 },
  { hour: "04:00", success: 0, failed: 4 },
  { hour: "08:00", success: 15, failed: 2 },
  { hour: "12:00", success: 28, failed: 1 },
  { hour: "16:00", success: 22, failed: 5 },
  { hour: "20:00", success: 8, failed: 2 },
];

const USERS_DATA = [
  {
    id: 1,
    name: "Alex Chen",
    email: "alex@acme.com",
    role: "Admin",
    storage: "412 GB",
    files: 47,
    lastLogin: "Active now",
    status: "active",
    mfa: true,
  },
  {
    id: 2,
    name: "Sarah Kim",
    email: "sarah@acme.com",
    role: "Editor",
    storage: "89 GB",
    files: 23,
    lastLogin: "2 hours ago",
    status: "active",
    mfa: true,
  },
  {
    id: 3,
    name: "Mike Torres",
    email: "mike@acme.com",
    role: "Viewer",
    storage: "234 GB",
    files: 156,
    lastLogin: "1 day ago",
    status: "active",
    mfa: false,
  },
  {
    id: 4,
    name: "Emily Walsh",
    email: "emily@acme.com",
    role: "Editor",
    storage: "45 GB",
    files: 34,
    lastLogin: "3 days ago",
    status: "active",
    mfa: true,
  },
  {
    id: 5,
    name: "Jordan Lee",
    email: "jordan@acme.com",
    role: "Viewer",
    storage: "12 GB",
    files: 8,
    lastLogin: "1 week ago",
    status: "inactive",
    mfa: false,
  },
];

const STORAGE_BY_USER = [
  { user: "Alex", storage: 412 },
  { user: "Mike", storage: 234 },
  { user: "Sarah", storage: 89 },
  { user: "Emily", storage: 45 },
  { user: "Jordan", storage: 12 },
];

const SHARING_ACTIVITY_DATA = [
  { month: "Sep", shared: 12, accessed: 45 },
  { month: "Oct", shared: 19, accessed: 67 },
  { month: "Nov", shared: 28, accessed: 89 },
  { month: "Dec", shared: 15, accessed: 56 },
  { month: "Jan", shared: 34, accessed: 112 },
];

const UPLOAD_DATA = [
  { day: "Mon", uploads: 12, downloads: 34 },
  { day: "Tue", uploads: 28, downloads: 52 },
  { day: "Wed", uploads: 19, downloads: 41 },
  { day: "Thu", uploads: 35, downloads: 67 },
  { day: "Fri", uploads: 22, downloads: 58 },
  { day: "Sat", uploads: 8, downloads: 23 },
  { day: "Sun", uploads: 5, downloads: 18 },
];

const STORAGE_DATA = [
  { month: "Aug", used: 180 },
  { month: "Sep", used: 220 },
  { month: "Oct", used: 265 },
  { month: "Nov", used: 310 },
  { month: "Dec", used: 375 },
  { month: "Jan", used: 412 },
];

const ENC_KEYS_DATA = [
  {
    id: "key-001",
    file: "Q4-Financial-Report.pdf",
    created: "Jan 15, 2024",
    rotated: "Jan 15, 2024",
    algorithm: "AES-256-GCM",
    status: "active",
  },
  {
    id: "key-002",
    file: "Design-Assets-2024.zip",
    created: "Jan 14, 2024",
    rotated: "Jan 14, 2024",
    algorithm: "AES-256-GCM",
    status: "active",
  },
  {
    id: "key-003",
    file: "Product-Roadmap-2024.docx",
    created: "Jan 12, 2024",
    rotated: "Jan 12, 2024",
    algorithm: "AES-256-GCM",
    status: "active",
  },
  {
    id: "key-004",
    file: "Old-File-2023.pdf (deleted)",
    created: "Oct 5, 2023",
    rotated: "Nov 1, 2023",
    algorithm: "AES-256-CBC",
    status: "rotated",
  },
];

const SYSTEM_STATUS = [
  {
    name: "API Server",
    status: "operational",
    latency: "12ms",
    uptime: "99.98%",
  },
  {
    name: "Encryption Service",
    status: "operational",
    latency: "4ms",
    uptime: "100%",
  },
  {
    name: "Storage (S3)",
    status: "operational",
    latency: "45ms",
    uptime: "99.99%",
  },
  {
    name: "Auth Service (JWT)",
    status: "operational",
    latency: "8ms",
    uptime: "99.97%",
  },
  {
    name: "Audit Logger (MongoDB)",
    status: "degraded",
    latency: "230ms",
    uptime: "98.12%",
  },
  {
    name: "Email Notifications",
    status: "operational",
    latency: "120ms",
    uptime: "99.90%",
  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function FileTypeIcon({
  type,
  size = 16,
}: {
  type: string;
  size?: number;
}) {
  if (type === "pdf")
    return (
      <FileText size={size} className="text-red-400 shrink-0" />
    );
  if (type === "image")
    return (
      <FileImage
        size={size}
        className="text-sky-400 shrink-0"
      />
    );
  if (type === "zip")
    return (
      <Archive
        size={size}
        className="text-amber-400 shrink-0"
      />
    );
  if (type === "doc")
    return (
      <FileText
        size={size}
        className="text-blue-400 shrink-0"
      />
    );
  return (
    <File size={size} className="text-[#B7A2C9] shrink-0" />
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "success" || status === "operational")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/15 text-green-400">
        <CheckCircle size={9} />{" "}
        {status === "operational" ? "Operational" : "Success"}
      </span>
    );
  if (status === "failed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-red-500/15 text-red-400">
        <XCircle size={9} /> Failed
      </span>
    );
  if (status === "degraded")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400">
        <AlertTriangle size={9} /> Degraded
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400">
      <AlertTriangle size={9} /> Warning
    </span>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium:
      "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${map[severity] || ""}`}
    >
      {severity}
    </span>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [category, setCategory] = useState("Finance");

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    setUploading(true);
    setTimeout(() => {
      setUploading(false);
      setDone(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#322F42] rounded-2xl border border-[#B7A2C9]/15 w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold">
            Upload files
          </h3>
          <button
            onClick={onClose}
            className="text-[#C5C3C4]/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center text-center transition-colors cursor-pointer
            ${dragging ? "border-[#4B3A70] bg-[#4B3A70]/10" : "border-[#B7A2C9]/20 hover:border-[#B7A2C9]/40"}`}
        >
          {done ? (
            <>
              <CheckCircle
                size={36}
                className="text-green-400 mb-3"
              />
              <p className="text-white text-sm font-medium">
                Upload complete!
              </p>
              <p className="text-[#C5C3C4]/60 text-xs mt-1">
                Encrypted with AES-256 and stored securely.
              </p>
            </>
          ) : uploading ? (
            <>
              <RefreshCw
                size={36}
                className="text-[#B7A2C9] mb-3 animate-spin"
              />
              <p className="text-white text-sm font-medium">
                Encrypting & uploading...
              </p>
              <p className="text-[#C5C3C4]/60 text-xs mt-1">
                AES-256 encryption in progress
              </p>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-[#4B3A70]/30 flex items-center justify-center mb-4">
                <Upload size={24} className="text-[#B7A2C9]" />
              </div>
              <p className="text-white text-sm font-medium mb-1">
                Drop files here to upload
              </p>
              <p className="text-[#C5C3C4]/60 text-xs mb-4">
                or click to browse your files
              </p>
              <button className="px-4 py-2 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors">
                Browse files
              </button>
            </>
          )}
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs text-[#C5C3C4]/70 font-medium mb-1.5 block">
              File category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-[#C5C3C4] focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
            >
              {[
                "Finance",
                "Legal",
                "Design",
                "Engineering",
                "Marketing",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="p-3 rounded-lg bg-[#212531]/60 flex items-start gap-2.5">
            <Lock
              size={12}
              className="text-[#B7A2C9] mt-0.5 shrink-0"
            />
            <p className="text-[#C5C3C4]/70 text-[11px] leading-relaxed">
              AES-256-GCM encryption · unique key per file ·
              stored in AWS S3 · metadata in PostgreSQL ·
              activity logged in MongoDB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Share Modal ───────────────────────────────────────────────────────────────
function ShareModal({
  file,
  onClose,
}: {
  file: (typeof FILES_DATA)[0];
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [access, setAccess] = useState("View only");
  const [expiry, setExpiry] = useState("7 days");
  const [restrictDownload, setRestrictDownload] =
    useState(true);
  const [watermark, setWatermark] = useState(false);
  const [maxDownloads, setMaxDownloads] = useState("10");
  const link = "https://trust.share/f/x7K2mN9qR";

  const copy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#322F42] rounded-2xl border border-[#B7A2C9]/15 w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold">
              Share file
            </h3>
            <p className="text-[#C5C3C4]/60 text-xs mt-0.5 truncate max-w-[300px]">
              {file.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[#C5C3C4]/50 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Secure link */}
          <div>
            <label className="text-xs text-[#C5C3C4]/70 font-medium mb-2 block">
              Secure share link
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-[#C5C3C4]/70 truncate flex items-center gap-2">
                <Lock
                  size={10}
                  className="text-green-400 shrink-0"
                />{" "}
                {link}
              </div>
              <button
                onClick={copy}
                className="px-3 py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? (
                  <>
                    <Check size={12} /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={12} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Access level */}
          <div>
            <label className="text-xs text-[#C5C3C4]/70 font-medium mb-2 block">
              Access level
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                "View only",
                "Download",
                "Edit",
                "Full access",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAccess(opt)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border text-left
                    ${access === opt ? "bg-[#4B3A70]/30 border-[#4B3A70]/60 text-white" : "bg-[#212531]/60 border-[#B7A2C9]/15 text-[#C5C3C4]/70 hover:border-[#B7A2C9]/30"}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Permission toggles */}
          <div className="bg-[#212531]/60 rounded-xl p-4 space-y-3">
            <label className="text-xs text-[#C5C3C4]/70 font-medium block">
              Download restrictions
            </label>
            {[
              {
                label: "Restrict downloads",
                desc: "Prevent recipients from downloading the file",
                value: restrictDownload,
                set: setRestrictDownload,
              },
              {
                label: "Watermark on view",
                desc: "Add recipient email watermark when previewing",
                value: watermark,
                set: setWatermark,
              },
            ].map(({ label, desc, value, set }) => (
              <div
                key={label}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-xs font-medium">
                    {label}
                  </p>
                  <p className="text-[#C5C3C4]/50 text-[10px] mt-0.5">
                    {desc}
                  </p>
                </div>
                <button
                  onClick={() => set(!value)}
                  className={`w-8 h-4 rounded-full transition-colors relative shrink-0 ${value ? "bg-[#4B3A70]" : "bg-[#2A2737] border border-[#B7A2C9]/20"}`}
                >
                  <span
                    className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${value ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </button>
              </div>
            ))}
            {!restrictDownload && (
              <div>
                <label className="text-xs text-[#C5C3C4]/70 mb-1.5 block">
                  Max downloads
                </label>
                <input
                  type="number"
                  value={maxDownloads}
                  onChange={(e) =>
                    setMaxDownloads(e.target.value)
                  }
                  className="w-full px-3 py-2 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
                />
              </div>
            )}
          </div>

          {/* Expiry + invite */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-[#C5C3C4]/70 font-medium mb-1.5 block">
                Link expires
              </label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-[#C5C3C4] focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
              >
                {[
                  "Never",
                  "1 hour",
                  "24 hours",
                  "7 days",
                  "30 days",
                ].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[#C5C3C4]/70 font-medium mb-1.5 block">
                Invite by email
              </label>
              <input
                type="email"
                placeholder="user@company.com"
                className="w-full px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-white placeholder:text-[#C5C3C4]/30 focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
              />
            </div>
          </div>

          {/* Share activity summary */}
          <div className="bg-[#212531]/60 rounded-xl p-3">
            <p className="text-xs text-[#C5C3C4]/60 font-medium mb-2">
              Share activity
            </p>
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                ["23", "Views"],
                ["9", "Downloads"],
                ["3", "Unique users"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-white text-base font-bold">
                    {v}
                  </p>
                  <p className="text-[#C5C3C4]/50 text-[10px]">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-[#B7A2C9]/20 text-[#C5C3C4] hover:border-[#B7A2C9]/40 rounded-lg text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-sm font-medium transition-colors">
            Save & share
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Version History Panel ─────────────────────────────────────────────────────
function VersionHistoryPanel({
  file,
  onClose,
}: {
  file: (typeof FILES_DATA)[0];
  onClose: () => void;
}) {
  const versions = VERSIONS_DATA[file.id] ?? [
    {
      version: "v1.0 (current)",
      date: file.modified,
      size: file.size,
      user: file.owner,
    },
  ];
  return (
    <div className="w-72 shrink-0 border-l border-[#B7A2C9]/08 flex flex-col bg-[#1A1825]">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#B7A2C9]/08">
        <div className="flex items-center gap-2 text-white font-medium text-sm">
          <History size={14} className="text-[#B7A2C9]" />{" "}
          Version history
        </div>
        <button
          onClick={onClose}
          className="text-[#C5C3C4]/40 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>
      <div className="p-4 border-b border-[#B7A2C9]/08">
        <p className="text-white text-xs font-medium truncate">
          {file.name}
        </p>
        <p className="text-[#C5C3C4]/50 text-[10px] mt-0.5">
          {versions.length} versions stored
        </p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {versions.map((v, i) => (
          <div
            key={v.version}
            className={`p-3 rounded-xl border transition-colors ${i === 0 ? "bg-[#4B3A70]/20 border-[#4B3A70]/30" : "bg-[#322F42]/40 border-[#B7A2C9]/08 hover:border-[#B7A2C9]/20"}`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-xs font-semibold">
                {v.version}
              </span>
              {i === 0 && (
                <span className="text-[10px] text-[#B7A2C9] font-medium">
                  Current
                </span>
              )}
            </div>
            <p className="text-[#C5C3C4]/60 text-[10px]">
              {v.date} · {v.size}
            </p>
            <p className="text-[#C5C3C4]/50 text-[10px]">
              by {v.user}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[9px] text-[#B7A2C9] bg-[#4B3A70]/20 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Lock size={8} /> AES-256
              </span>
            </div>
            {i > 0 && (
              <button className="mt-2 text-[10px] text-[#B7A2C9] hover:text-white transition-colors flex items-center gap-1">
                <RotateCcw size={9} /> Restore this version
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── File Metadata Panel ───────────────────────────────────────────────────────
function FileMetadataPanel({
  file,
  onClose,
}: {
  file: (typeof FILES_DATA)[0];
  onClose: () => void;
}) {
  return (
    <div className="w-72 shrink-0 border-l border-[#B7A2C9]/08 flex flex-col bg-[#1A1825]">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#B7A2C9]/08">
        <div className="flex items-center gap-2 text-white font-medium text-sm">
          <Info size={14} className="text-[#B7A2C9]" /> File
          metadata
        </div>
        <button
          onClick={onClose}
          className="text-[#C5C3C4]/40 hover:text-white transition-colors"
        >
          <X size={15} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#322F42] flex items-center justify-center">
            <FileTypeIcon type={file.type} size={18} />
          </div>
          <div>
            <p className="text-white text-xs font-medium">
              {file.name}
            </p>
            <p className="text-[#C5C3C4]/50 text-[10px]">
              {file.size} · {file.type.toUpperCase()}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            ["Owner", file.owner],
            ["Category", file.category],
            ["Modified", file.modified],
            ["Versions", String(file.versions)],
            ["Downloads", String(file.downloads)],
            [
              "Shared",
              file.shared ? "Yes (3 recipients)" : "No",
            ],
            ["Encryption", "AES-256-GCM"],
            [
              "Key ID",
              "key-" + String(file.id).padStart(3, "0"),
            ],
            ["Storage", "AWS S3 (us-east-1)"],
            ["Checksum", "sha256:a3f5c..."],
          ].map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between py-1.5 border-b border-[#B7A2C9]/06 last:border-0"
            >
              <span className="text-[#C5C3C4]/50 text-[11px]">
                {k}
              </span>
              <span className="text-white text-[11px] font-medium">
                {v}
              </span>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-xl bg-[#4B3A70]/15 border border-[#4B3A70]/25 flex items-center gap-2">
          <ShieldCheck
            size={13}
            className="text-green-400 shrink-0"
          />
          <p className="text-[#C5C3C4]/80 text-[11px]">
            Encrypted at rest · HTTPS in transit · audit-logged
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Sidebar ───────────────────────────────────────────────────────────────────
const NAV_ITEMS: {
  tab: AppTab;
  icon: React.ElementType;
  label: string;
  section?: string;
}[] = [
  {
    tab: "files",
    icon: Folder,
    label: "My Files",
    section: "Personal",
  },
  { tab: "shared", icon: Share2, label: "Shared with me" },
  { tab: "recent", icon: Clock, label: "Recent" },
  { tab: "starred", icon: Star, label: "Starred" },
  { tab: "trash", icon: Trash2, label: "Trash" },
  {
    tab: "shares",
    icon: Link,
    label: "Shared Links",
    section: "Sharing",
  },
  {
    tab: "analytics",
    icon: BarChart3,
    label: "Analytics",
    section: "Management",
  },
  { tab: "auditlog", icon: Activity, label: "Audit Log" },
  { tab: "security", icon: ShieldAlert, label: "Security" },
  { tab: "admin", icon: Users, label: "Admin" },
  { tab: "notifications", icon: Bell, label: "Notifications" },
  {
    tab: "settings",
    icon: Settings,
    label: "Settings",
    section: "Account",
  },
];

function Sidebar({
  tab,
  setTab,
  onSignOut,
  unread,
}: {
  tab: AppTab;
  setTab: (t: AppTab) => void;
  onSignOut: () => void;
  unread: number;
}) {
  return (
    <aside
      className="w-56 shrink-0 flex flex-col border-r border-[#B7A2C9]/08"
      style={{ background: "#1A1825" }}
    >
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-[#B7A2C9]/08">
        <div className="w-7 h-7 rounded-lg bg-[#4B3A70] flex items-center justify-center">
          <Shield size={13} className="text-white" />
        </div>
        <span className="text-white font-semibold text-sm tracking-tight">
          TrustShare
        </span>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive = tab === item.tab;
          const prev = NAV_ITEMS[i - 1];
          const showSection =
            item.section && item.section !== prev?.section;
          return (
            <div key={item.tab}>
              {showSection && (
                <p className="text-[#C5C3C4]/35 text-[10px] font-semibold uppercase tracking-wider px-3 pt-4 pb-1.5">
                  {item.section}
                </p>
              )}
              <button
                onClick={() => setTab(item.tab)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left
                  ${isActive ? "bg-[#4B3A70]/40 text-white" : "text-[#C5C3C4]/70 hover:bg-[#322F42]/60 hover:text-[#C5C3C4]"}`}
              >
                <Icon
                  size={14}
                  className={isActive ? "text-[#B7A2C9]" : ""}
                />
                <span className="text-xs">{item.label}</span>
                {item.tab === "notifications" && unread > 0 && (
                  <span className="ml-auto text-[10px] font-semibold bg-[#4B3A70] text-white rounded-full w-4 h-4 flex items-center justify-center">
                    {unread}
                  </span>
                )}
                {item.tab === "security" && (
                  <span className="ml-auto text-[10px] font-semibold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                    3
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </nav>
      <div className="px-4 py-2 border-t border-[#B7A2C9]/08 mx-3 mb-1">
        <div className="flex items-center justify-between text-[10px] mb-1">
          <span className="text-[#C5C3C4]/60">Storage</span>
          <span className="text-[#C5C3C4]/60">
            412 / 500 GB
          </span>
        </div>
        <div className="h-1 rounded-full bg-[#322F42]">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-[#4B3A70] to-[#B7A2C9]"
            style={{ width: "82%" }}
          />
        </div>
      </div>
      <div className="p-3 border-t border-[#B7A2C9]/08 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-[#4B3A70] flex items-center justify-center text-white text-xs font-semibold shrink-0">
          AC
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">
            Alex Chen
          </p>
          <p className="text-[#C5C3C4]/50 text-[10px] truncate flex items-center gap-1">
            <ShieldCheck size={8} className="text-green-400" />{" "}
            JWT · MFA on
          </p>
        </div>
        <button
          onClick={onSignOut}
          className="text-[#C5C3C4]/40 hover:text-[#C5C3C4] transition-colors shrink-0"
        >
          <LogOut size={13} />
        </button>
      </div>
    </aside>
  );
}

// ─── TopBar ────────────────────────────────────────────────────────────────────
function TopBar({
  title,
  search,
  setSearch,
  actions,
}: {
  title: string;
  search: string;
  setSearch: (v: string) => void;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#B7A2C9]/08 shrink-0">
      <h1 className="text-white font-semibold text-base">
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5C3C4]/40"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="pl-8 pr-4 py-2 bg-[#322F42]/60 border border-[#B7A2C9]/12 rounded-lg text-xs text-[#C5C3C4] placeholder:text-[#C5C3C4]/35 focus:outline-none focus:border-[#4B3A70]/50 transition-colors w-44"
          />
        </div>
        {actions}
      </div>
    </div>
  );
}

// ─── Files View ────────────────────────────────────────────────────────────────
function FilesView({
  onUpload,
  onShare,
}: {
  onUpload: () => void;
  onShare: (f: (typeof FILES_DATA)[0]) => void;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [versionFile, setVersionFile] = useState<
    (typeof FILES_DATA)[0] | null
  >(null);
  const [metaFile, setMetaFile] = useState<
    (typeof FILES_DATA)[0] | null
  >(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeFolder, setActiveFolder] = useState<
    number | null
  >(null);

  const categories = [
    "All",
    "Finance",
    "Legal",
    "Design",
    "Engineering",
    "Marketing",
  ];
  const files = FILES_DATA.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) &&
      (activeCategory === "All" ||
        f.category === activeCategory),
  );

  const toggleSelect = (id: number) =>
    setSelected((s) =>
      s.includes(id) ? s.filter((x) => x !== id) : [...s, id],
    );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopBar
        title="My Files"
        search={search}
        setSearch={setSearch}
        actions={
          <button
            onClick={onUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors"
          >
            <Upload size={12} /> Upload
          </button>
        }
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Folder sidebar */}
        <div className="w-44 shrink-0 border-r border-[#B7A2C9]/08 p-3 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#C5C3C4]/40 text-[10px] font-semibold uppercase tracking-wider">
              Folders
            </span>
            <button className="text-[#B7A2C9] hover:text-white transition-colors">
              <Plus size={12} />
            </button>
          </div>
          <button
            onClick={() => setActiveFolder(null)}
            className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors mb-1 ${activeFolder === null ? "bg-[#4B3A70]/30 text-white" : "text-[#C5C3C4]/70 hover:bg-[#322F42]/60"}`}
          >
            <FolderOpen size={12} className="text-[#B7A2C9]" />{" "}
            All files
          </button>
          {FOLDERS_DATA.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs transition-colors mb-0.5 ${activeFolder === folder.id ? "bg-[#4B3A70]/30 text-white" : "text-[#C5C3C4]/70 hover:bg-[#322F42]/60"}`}
            >
              <Folder
                size={12}
                style={{ color: folder.color }}
              />
              <span className="truncate">{folder.name}</span>
              <span className="ml-auto text-[10px] text-[#C5C3C4]/40">
                {folder.files}
              </span>
            </button>
          ))}
          <button className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs text-[#C5C3C4]/40 hover:text-[#B7A2C9] transition-colors border border-dashed border-[#B7A2C9]/15 hover:border-[#B7A2C9]/30 mt-2">
            <Plus size={11} /> New folder
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category filter */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-[#B7A2C9]/08 overflow-x-auto shrink-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors shrink-0
                  ${activeCategory === cat ? "bg-[#4B3A70] text-white" : "text-[#C5C3C4]/60 hover:bg-[#322F42]/60 hover:text-[#C5C3C4]"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {selected.length > 0 && (
              <div className="flex items-center gap-3 mb-3 px-4 py-2 bg-[#4B3A70]/20 border border-[#4B3A70]/30 rounded-xl">
                <span className="text-[#B7A2C9] text-xs font-medium">
                  {selected.length} selected
                </span>
                <button className="text-xs text-[#C5C3C4]/70 hover:text-white transition-colors flex items-center gap-1">
                  <Share2 size={11} /> Share
                </button>
                <button className="text-xs text-[#C5C3C4]/70 hover:text-white transition-colors flex items-center gap-1">
                  <Download size={11} /> Download
                </button>
                <button className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 ml-auto">
                  <Trash2 size={11} /> Delete
                </button>
              </div>
            )}

            <div className="bg-[#322F42]/40 rounded-xl border border-[#B7A2C9]/08 overflow-hidden">
              <div
                className="grid text-[10px] font-semibold text-[#C5C3C4]/40 uppercase tracking-wider px-4 py-3 border-b border-[#B7A2C9]/08"
                style={{
                  gridTemplateColumns:
                    "2rem 1fr 90px 80px 70px 70px 80px 2.5rem",
                }}
              >
                <div />
                <div>Name</div>
                <div>Owner</div>
                <div>Modified</div>
                <div>Size</div>
                <div>Category</div>
                <div>Shared</div>
                <div />
              </div>
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`grid items-center px-4 py-2.5 border-b border-[#B7A2C9]/05 last:border-0 hover:bg-[#B7A2C9]/04 transition-colors relative
                    ${selected.includes(file.id) ? "bg-[#4B3A70]/10" : ""}`}
                  style={{
                    gridTemplateColumns:
                      "2rem 1fr 90px 80px 70px 70px 80px 2.5rem",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(file.id)}
                    onChange={() => toggleSelect(file.id)}
                    className="w-3.5 h-3.5 rounded border-[#B7A2C9]/30 accent-[#4B3A70] cursor-pointer"
                  />
                  <div className="flex items-center gap-2 min-w-0">
                    <FileTypeIcon type={file.type} size={14} />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {file.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[#C5C3C4]/40 text-[9px]">
                          {file.downloads} dl
                        </span>
                        {file.versions > 1 && (
                          <span className="text-[#B7A2C9]/60 text-[9px]">
                            v{file.versions}
                          </span>
                        )}
                        <span className="text-[9px] text-green-400 flex items-center gap-0.5">
                          <Lock size={7} /> AES-256
                        </span>
                      </div>
                    </div>
                    {file.starred && (
                      <Star
                        size={10}
                        className="text-amber-400 shrink-0"
                        fill="currentColor"
                      />
                    )}
                  </div>
                  <div className="text-[#C5C3C4]/60 text-[11px] truncate">
                    {file.owner}
                  </div>
                  <div className="text-[#C5C3C4]/60 text-[11px]">
                    {file.modified.split(",")[0]}
                  </div>
                  <div className="text-[#C5C3C4]/60 text-[11px]">
                    {file.size}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#B7A2C9]/70 bg-[#4B3A70]/15 px-1.5 py-0.5 rounded truncate">
                      {file.category}
                    </span>
                  </div>
                  <div>
                    {file.shared ? (
                      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-[#4B3A70]/30 text-[#B7A2C9] font-medium">
                        <Globe size={8} /> Shared
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-[#322F42] text-[#C5C3C4]/40 font-medium">
                        <Lock size={8} /> Private
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenu(
                          openMenu === file.id ? null : file.id,
                        )
                      }
                      className="p-1 rounded hover:bg-[#B7A2C9]/10 text-[#C5C3C4]/40 hover:text-[#C5C3C4] transition-colors"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                    {openMenu === file.id && (
                      <div className="absolute right-0 top-7 z-10 w-40 bg-[#322F42] border border-[#B7A2C9]/15 rounded-xl py-1 shadow-xl">
                        {[
                          {
                            icon: Share2,
                            label: "Share",
                            action: () => {
                              onShare(file);
                              setOpenMenu(null);
                            },
                          },
                          {
                            icon: Download,
                            label: "Download",
                            action: () => setOpenMenu(null),
                          },
                          {
                            icon: Eye,
                            label: "Preview",
                            action: () => setOpenMenu(null),
                          },
                          {
                            icon: History,
                            label: "Version history",
                            action: () => {
                              setVersionFile(file);
                              setOpenMenu(null);
                            },
                          },
                          {
                            icon: Info,
                            label: "View metadata",
                            action: () => {
                              setMetaFile(file);
                              setOpenMenu(null);
                            },
                          },
                          {
                            icon: Trash2,
                            label: "Delete",
                            action: () => setOpenMenu(null),
                            danger: true,
                          },
                        ].map(
                          ({
                            icon: Icon,
                            label,
                            action,
                            danger,
                          }) => (
                            <button
                              key={label}
                              onClick={action}
                              className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs transition-colors
                              ${danger ? "text-red-400 hover:bg-red-500/10" : "text-[#C5C3C4] hover:bg-[#B7A2C9]/08"}`}
                            >
                              <Icon size={12} /> {label}
                            </button>
                          ),
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-4 text-xs text-[#C5C3C4]/40">
              <span>{files.length} files · 462 MB used</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    className={`w-7 h-7 rounded-lg text-xs transition-colors ${p === 1 ? "bg-[#4B3A70] text-white" : "hover:bg-[#322F42] text-[#C5C3C4]/60"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Side panels */}
        {versionFile && (
          <VersionHistoryPanel
            file={versionFile}
            onClose={() => setVersionFile(null)}
          />
        )}
        {metaFile && !versionFile && (
          <FileMetadataPanel
            file={metaFile}
            onClose={() => setMetaFile(null)}
          />
        )}
      </div>
    </div>
  );
}

// ─── Share Links View ──────────────────────────────────────────────────────────
function SharesView() {
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState(SHARE_LINKS_DATA);
  const filtered = links.filter((l) =>
    l.file.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Shared Links"
        search={search}
        setSearch={setSearch}
        actions={
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors">
            <Plus size={12} /> New link
          </button>
        }
      />
      <div className="flex-1 overflow-auto p-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {
              label: "Active links",
              value: "3",
              icon: Link,
              color: "#B7A2C9",
            },
            {
              label: "Total views",
              value: "133",
              icon: Eye,
              color: "#60A5FA",
            },
            {
              label: "Total downloads",
              value: "57",
              icon: Download,
              color: "#22C55E",
            },
            {
              label: "Expiring soon",
              value: "2",
              icon: Clock,
              color: "#F59E0B",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#C5C3C4]/60 text-xs">
                  {label}
                </span>
                <Icon size={13} style={{ color }} />
              </div>
              <p className="text-white text-xl font-bold">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* Sharing activity chart */}
        <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-medium text-sm">
                Sharing activity
              </h3>
              <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                Links created vs. access events per month
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#C5C3C4]/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#4B3A70]" />{" "}
                Links created
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#B7A2C9]" />{" "}
                Access events
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={SHARING_ACTIVITY_DATA} barGap={4}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(183,162,201,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fill: "#8B879A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8B879A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#322F42",
                  border: "1px solid rgba(183,162,201,0.15)",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                  color: "#C5C3C4",
                }}
                cursor={{ fill: "rgba(183,162,201,0.05)" }}
              />
              <Bar
                key="bar-shared"
                dataKey="shared"
                name="Links created"
                fill="#4B3A70"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                key="bar-accessed"
                dataKey="accessed"
                name="Access events"
                fill="#B7A2C9"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Links table */}
        <div className="bg-[#322F42]/40 rounded-xl border border-[#B7A2C9]/08 overflow-hidden">
          <div
            className="grid text-[10px] font-semibold text-[#C5C3C4]/40 uppercase tracking-wider px-4 py-3 border-b border-[#B7A2C9]/08"
            style={{
              gridTemplateColumns:
                "1fr 120px 80px 80px 80px 90px 80px 60px",
            }}
          >
            <div>File</div>
            <div>Link</div>
            <div>Created</div>
            <div>Expires</div>
            <div>Views</div>
            <div>Downloads</div>
            <div>Access</div>
            <div>Status</div>
          </div>
          {filtered.map((link) => (
            <div
              key={link.id}
              className="grid items-center px-4 py-3 border-b border-[#B7A2C9]/05 last:border-0 hover:bg-[#B7A2C9]/04 transition-colors text-xs"
              style={{
                gridTemplateColumns:
                  "1fr 120px 80px 80px 80px 90px 80px 60px",
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FileTypeIcon
                  type={
                    FILES_DATA.find((f) => f.name === link.file)
                      ?.type ?? "file"
                  }
                  size={13}
                />
                <span className="text-white font-medium truncate">
                  {link.file}
                </span>
              </div>
              <div className="text-[#C5C3C4]/50 text-[10px] font-mono truncate">
                {link.link}
              </div>
              <div className="text-[#C5C3C4]/60">
                {link.created}
              </div>
              <div className="text-[#C5C3C4]/60">
                {link.expires === "Never"
                  ? "Never"
                  : link.expires.split(",")[0]}
              </div>
              <div className="text-[#C5C3C4]/80">
                {link.views}
              </div>
              <div className="flex items-center gap-1 text-[#C5C3C4]/80">
                {link.restrict && (
                  <Lock size={9} className="text-amber-400" />
                )}
                {link.downloads}
              </div>
              <div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded ${link.access === "View only" ? "bg-sky-500/15 text-sky-400" : "bg-green-500/15 text-green-400"}`}
                >
                  {link.access}
                </span>
              </div>
              <div>
                <button
                  onClick={() =>
                    setLinks((ls) =>
                      ls.map((l) =>
                        l.id === link.id
                          ? { ...l, active: !l.active }
                          : l,
                      ),
                    )
                  }
                  className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${link.active ? "bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400" : "bg-red-500/15 text-red-400 hover:bg-green-500/15 hover:text-green-400"}`}
                >
                  {link.active ? "Active" : "Revoked"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Audit Log View ────────────────────────────────────────────────────────────
function AuditLogView() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const filtered = AUDIT_DATA.filter(
    (e) =>
      (filter === "all" ||
        (filter === "suspicious"
          ? e.suspicious
          : e.status === filter)) &&
      (e.user.includes(search) ||
        e.action.toLowerCase().includes(search.toLowerCase()) ||
        e.file.includes(search)),
  );

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Audit Log"
        search={search}
        setSearch={setSearch}
        actions={
          <div className="flex items-center gap-1 bg-[#322F42]/60 border border-[#B7A2C9]/12 rounded-lg p-0.5">
            {[
              "all",
              "success",
              "failed",
              "warning",
              "suspicious",
            ].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium capitalize transition-colors
                  ${filter === f ? (f === "suspicious" ? "bg-red-500/80 text-white" : "bg-[#4B3A70] text-white") : "text-[#C5C3C4]/60 hover:text-[#C5C3C4]"}`}
              >
                {f}
              </button>
            ))}
          </div>
        }
      />
      <div className="flex-1 overflow-auto p-5">
        <div className="bg-[#322F42]/40 rounded-xl border border-[#B7A2C9]/08 overflow-hidden">
          <div
            className="grid text-[10px] font-semibold text-[#C5C3C4]/40 uppercase tracking-wider px-4 py-3 border-b border-[#B7A2C9]/08"
            style={{
              gridTemplateColumns:
                "155px 155px 1fr 1fr 100px 80px 24px",
            }}
          >
            <div>Timestamp</div>
            <div>User</div>
            <div>Action</div>
            <div>File</div>
            <div>IP Address</div>
            <div>Status</div>
            <div />
          </div>
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className={`grid items-center px-4 py-2.5 border-b border-[#B7A2C9]/05 last:border-0 text-xs hover:bg-[#B7A2C9]/04 transition-colors
                ${entry.suspicious ? "bg-red-500/05 border-l-2 border-l-red-500/40" : entry.status === "failed" ? "bg-red-500/03" : ""}`}
              style={{
                gridTemplateColumns:
                  "155px 155px 1fr 1fr 100px 80px 24px",
              }}
            >
              <div className="text-[#C5C3C4]/50 font-mono text-[10px]">
                {entry.ts}
              </div>
              <div className="text-[#C5C3C4]/80 truncate pr-2">
                {entry.user}
              </div>
              <div className="text-white font-medium truncate pr-2">
                {entry.action}
              </div>
              <div className="text-[#C5C3C4]/60 truncate pr-2">
                {entry.file}
              </div>
              <div className="text-[#C5C3C4]/50 font-mono text-[10px]">
                {entry.ip}
              </div>
              <div>
                <StatusBadge status={entry.status} />
              </div>
              <div>
                {entry.suspicious && (
                  <span title="Suspicious activity">
                    <AlertTriangle size={12} className="text-red-400" />
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-xs text-[#C5C3C4]/40 text-right">
          {filtered.length} of {AUDIT_DATA.length} entries ·
          stored in MongoDB
        </div>
      </div>
    </div>
  );
}

// ─── Security Dashboard ────────────────────────────────────────────────────────
function SecurityView() {
  const [search, setSearch] = useState("");
  const securityStats = [
    {
      label: "Blocked attacks",
      value: "47",
      sub: "last 30 days",
      icon: ShieldAlert,
      color: "#EF4444",
    },
    {
      label: "Failed logins",
      value: "23",
      sub: "+5 today",
      icon: XCircle,
      color: "#F59E0B",
    },
    {
      label: "MFA coverage",
      value: "60%",
      sub: "3 of 5 users",
      icon: Smartphone,
      color: "#22C55E",
    },
    {
      label: "Key rotations",
      value: "12",
      sub: "this month",
      icon: Key,
      color: "#B7A2C9",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Security Dashboard"
        search={search}
        setSearch={setSearch}
      />
      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {securityStats.map(
            ({ label, value, sub, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#C5C3C4]/60 text-xs">
                    {label}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}20` }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                </div>
                <p className="text-white text-xl font-bold mb-0.5">
                  {value}
                </p>
                <p className="text-[#C5C3C4]/50 text-[11px]">
                  {sub}
                </p>
              </div>
            ),
          )}
        </div>

        {/* Login monitoring chart */}
        <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-medium text-sm">
                Login activity — today
              </h3>
              <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                Successful vs. failed authentication attempts
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#C5C3C4]/60">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#22C55E]" />{" "}
                Success
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-[#EF4444]" />{" "}
                Failed
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={LOGIN_ATTEMPTS_DATA}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(183,162,201,0.08)"
                vertical={false}
              />
              <XAxis
                dataKey="hour"
                tick={{ fill: "#8B879A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#8B879A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#322F42",
                  border: "1px solid rgba(183,162,201,0.15)",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                  color: "#C5C3C4",
                }}
              />
              <Line
                key="line-success"
                type="monotone"
                dataKey="success"
                name="Successful"
                stroke="#22C55E"
                strokeWidth={2}
                dot={{ fill: "#22C55E", r: 3 }}
              />
              <Line
                key="line-failed"
                type="monotone"
                dataKey="failed"
                name="Failed"
                stroke="#EF4444"
                strokeWidth={2}
                dot={{ fill: "#EF4444", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Security events table */}
        <div className="bg-[#322F42]/40 rounded-xl border border-[#B7A2C9]/08 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#B7A2C9]/08">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400" />
              <span className="text-white font-medium text-sm">
                Security events
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-semibold">
                3 critical
              </span>
            </div>
          </div>
          <div
            className="grid text-[10px] font-semibold text-[#C5C3C4]/40 uppercase tracking-wider px-4 py-2.5 border-b border-[#B7A2C9]/08"
            style={{
              gridTemplateColumns:
                "130px 1fr 130px 50px 70px 70px",
            }}
          >
            <div>Timestamp</div>
            <div>Event</div>
            <div>Source IP</div>
            <div>Country</div>
            <div>Severity</div>
            <div>Action</div>
          </div>
          {SECURITY_EVENTS_DATA.map((ev) => (
            <div
              key={ev.id}
              className={`grid items-center px-4 py-2.5 border-b border-[#B7A2C9]/05 last:border-0 text-xs hover:bg-[#B7A2C9]/04 transition-colors
              ${ev.severity === "critical" ? "bg-red-500/05" : ev.severity === "high" ? "bg-orange-500/04" : ""}`}
              style={{
                gridTemplateColumns:
                  "130px 1fr 130px 50px 70px 70px",
              }}
            >
              <div className="text-[#C5C3C4]/50 font-mono text-[10px]">
                {ev.ts}
              </div>
              <div className="text-white font-medium">
                {ev.event}
              </div>
              <div className="text-[#C5C3C4]/60 font-mono text-[10px]">
                {ev.source}
              </div>
              <div className="text-[#C5C3C4]/60">
                {ev.country}
              </div>
              <div>
                <SeverityBadge severity={ev.severity} />
              </div>
              <div>
                {ev.blocked ? (
                  <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                    <ShieldCheck size={9} /> Blocked
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                    <AlertTriangle size={9} /> Monitor
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Encryption / key rotation status */}
        <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={14} className="text-[#B7A2C9]" />
            <h3 className="text-white font-medium text-sm">
              Encryption key management
            </h3>
            <span className="ml-auto text-xs text-[#B7A2C9] hover:text-white transition-colors cursor-pointer flex items-center gap-1">
              <RotateCcw size={11} /> Rotate all keys
            </span>
          </div>
          <div className="space-y-2">
            {ENC_KEYS_DATA.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between px-3 py-2.5 bg-[#212531]/60 rounded-lg"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Key
                    size={12}
                    className="text-[#B7A2C9] shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-mono">
                      {key.id}
                    </p>
                    <p className="text-[#C5C3C4]/50 text-[10px] truncate">
                      {key.file}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-[#C5C3C4]/60 shrink-0">
                  <span className="hidden md:block">
                    {key.algorithm}
                  </span>
                  <span>Rotated: {key.rotated}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded font-medium ${key.status === "active" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}
                  >
                    {key.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Analytics View ────────────────────────────────────────────────────────────
function AnalyticsView() {
  const [search, setSearch] = useState("");
  const [atab, setAtab] = useState<"files" | "sharing">(
    "files",
  );
  const stats = [
    {
      label: "Total Storage",
      value: "412 GB",
      sub: "of 500 GB",
      icon: HardDrive,
      color: "#B7A2C9",
    },
    {
      label: "Files Shared",
      value: "247",
      sub: "+12 this week",
      icon: Share2,
      color: "#22C55E",
    },
    {
      label: "Total Downloads",
      value: "1,834",
      sub: "+89 today",
      icon: Download,
      color: "#60A5FA",
    },
    {
      label: "Active Users",
      value: "28",
      sub: "of 50 seats",
      icon: Users,
      color: "#F59E0B",
    },
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Analytics"
        search={search}
        setSearch={setSearch}
        actions={
          <div className="flex gap-1 bg-[#322F42]/60 border border-[#B7A2C9]/12 rounded-lg p-0.5">
            {(["files", "sharing"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setAtab(t)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${atab === t ? "bg-[#4B3A70] text-white" : "text-[#C5C3C4]/60 hover:text-[#C5C3C4]"}`}
              >
                {t === "files"
                  ? "File analytics"
                  : "Sharing reports"}
              </button>
            ))}
          </div>
        }
      />
      <div className="flex-1 overflow-auto p-5 space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(
            ({ label, value, sub, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#C5C3C4]/60 text-xs">
                    {label}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}20` }}
                  >
                    <Icon size={13} style={{ color }} />
                  </div>
                </div>
                <p className="text-white text-xl font-bold mb-0.5">
                  {value}
                </p>
                <p className="text-[#C5C3C4]/50 text-[11px]">
                  {sub}
                </p>
              </div>
            ),
          )}
        </div>

        {atab === "files" && (
          <>
            <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium text-sm">
                    Uploads & Downloads
                  </h3>
                  <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                    Last 7 days
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#C5C3C4]/60">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-[#4B3A70]" />{" "}
                    Uploads
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm bg-[#22C55E]" />{" "}
                    Downloads
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={UPLOAD_DATA} barGap={4}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(183,162,201,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#8B879A", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8B879A", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#322F42",
                      border:
                        "1px solid rgba(183,162,201,0.15)",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                      color: "#C5C3C4",
                    }}
                    cursor={{ fill: "rgba(183,162,201,0.05)" }}
                  />
                  <Bar
                    key="bar-uploads"
                    dataKey="uploads"
                    name="Uploads"
                    fill="#4B3A70"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    key="bar-downloads"
                    dataKey="downloads"
                    name="Downloads"
                    fill="#22C55E"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium text-sm">
                    Storage Growth
                  </h3>
                  <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                    6-month usage trend (GB)
                  </p>
                </div>
                <span className="text-xs text-[#B7A2C9] flex items-center gap-1">
                  <TrendingUp size={12} /> +129%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={STORAGE_DATA}>
                  <defs>
                    <linearGradient
                      id="ts-storage-grad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#B7A2C9"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#B7A2C9"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(183,162,201,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#8B879A", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8B879A", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#322F42",
                      border:
                        "1px solid rgba(183,162,201,0.15)",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                      color: "#C5C3C4",
                    }}
                  />
                  <Area
                    key="area-used"
                    type="monotone"
                    dataKey="used"
                    name="Storage (GB)"
                    stroke="#B7A2C9"
                    strokeWidth={2}
                    fill="url(#ts-storage-grad)"
                    dot={{ fill: "#B7A2C9", r: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {atab === "sharing" && (
          <>
            <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
              <h3 className="text-white font-medium text-sm mb-4">
                Sharing activity over time
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={SHARING_ACTIVITY_DATA}
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(183,162,201,0.08)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#8B879A", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8B879A", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#322F42",
                      border:
                        "1px solid rgba(183,162,201,0.15)",
                      borderRadius: "0.5rem",
                      fontSize: 12,
                      color: "#C5C3C4",
                    }}
                    cursor={{ fill: "rgba(183,162,201,0.05)" }}
                  />
                  <Bar
                    key="bar-sh"
                    dataKey="shared"
                    name="Links created"
                    fill="#4B3A70"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    key="bar-ac"
                    dataKey="accessed"
                    name="Access events"
                    fill="#B7A2C9"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                [
                  "Most shared files",
                  [
                    ["Q4-Financial-Report.pdf", "23 shares"],
                    ["Product-Roadmap-2024.docx", "18 shares"],
                    ["Marketing-Deck-Q1.pptx", "12 shares"],
                  ],
                ],
                [
                  "Top downloaders",
                  [
                    ["alex@acme.com", "45 downloads"],
                    ["emily@acme.com", "23 downloads"],
                    ["mike@acme.com", "18 downloads"],
                  ],
                ],
              ].map(([title, rows]) => (
                <div
                  key={title as string}
                  className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-4"
                >
                  <h3 className="text-white font-medium text-sm mb-3">
                    {title}
                  </h3>
                  {(rows as string[][]).map(([name, val]) => (
                    <div
                      key={name}
                      className="flex items-center justify-between py-2 border-b border-[#B7A2C9]/06 last:border-0"
                    >
                      <span className="text-[#C5C3C4]/80 text-xs truncate">
                        {name}
                      </span>
                      <span className="text-[#B7A2C9] text-xs font-medium shrink-0 ml-2">
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────────
function AdminView() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(USERS_DATA);

  const systemStatusItems = SYSTEM_STATUS;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Admin Dashboard"
        search={search}
        setSearch={setSearch}
        actions={
          <button className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors">
            <UserPlus size={12} /> Invite user
          </button>
        }
      />
      <div className="flex-1 overflow-auto p-5 space-y-5">
        {/* Admin stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total users",
              value: "5",
              sub: "3 active now",
              icon: Users,
              color: "#B7A2C9",
            },
            {
              label: "Total storage used",
              value: "792 GB",
              sub: "of 2.5 TB plan",
              icon: HardDrive,
              color: "#60A5FA",
            },
            {
              label: "Files this month",
              value: "234",
              sub: "+47 this week",
              icon: File,
              color: "#22C55E",
            },
            {
              label: "Share links active",
              value: "3",
              sub: "1 expiring soon",
              icon: Link,
              color: "#F59E0B",
            },
          ].map(({ label, value, sub, icon: Icon, color }) => (
            <div
              key={label}
              className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#C5C3C4]/60 text-xs">
                  {label}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: `${color}20` }}
                >
                  <Icon size={13} style={{ color }} />
                </div>
              </div>
              <p className="text-white text-xl font-bold mb-0.5">
                {value}
              </p>
              <p className="text-[#C5C3C4]/50 text-[11px]">
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Storage by user chart */}
        <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
          <h3 className="text-white font-medium text-sm mb-4">
            Storage utilization by user
          </h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={STORAGE_BY_USER} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(183,162,201,0.08)"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fill: "#8B879A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                unit=" GB"
              />
              <YAxis
                type="category"
                dataKey="user"
                tick={{ fill: "#8B879A", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: "#322F42",
                  border: "1px solid rgba(183,162,201,0.15)",
                  borderRadius: "0.5rem",
                  fontSize: 12,
                  color: "#C5C3C4",
                }}
                formatter={(v) => [`${v} GB`, "Storage"]}
              />
              <Bar
                key="bar-storage"
                dataKey="storage"
                name="Storage (GB)"
                fill="#4B3A70"
                radius={[0, 3, 3, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* User management table */}
        <div className="bg-[#322F42]/40 rounded-xl border border-[#B7A2C9]/08 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#B7A2C9]/08">
            <span className="text-white font-medium text-sm">
              User management
            </span>
            <span className="text-[#C5C3C4]/50 text-xs">
              {
                users.filter((u) => u.status === "active")
                  .length
              }{" "}
              active
            </span>
          </div>
          <div
            className="grid text-[10px] font-semibold text-[#C5C3C4]/40 uppercase tracking-wider px-4 py-2.5 border-b border-[#B7A2C9]/08"
            style={{
              gridTemplateColumns:
                "1fr 130px 80px 80px 60px 80px 80px 70px",
            }}
          >
            <div>User</div>
            <div>Email</div>
            <div>Role</div>
            <div>Storage</div>
            <div>Files</div>
            <div>Last login</div>
            <div>MFA</div>
            <div>Status</div>
          </div>
          {users
            .filter(
              (u) =>
                u.name
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                u.email.includes(search),
            )
            .map((user) => (
              <div
                key={user.id}
                className="grid items-center px-4 py-2.5 border-b border-[#B7A2C9]/05 last:border-0 hover:bg-[#B7A2C9]/04 transition-colors text-xs"
                style={{
                  gridTemplateColumns:
                    "1fr 130px 80px 80px 60px 80px 80px 70px",
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#4B3A70] flex items-center justify-center text-white text-[10px] font-semibold shrink-0">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <span className="text-white font-medium truncate">
                    {user.name}
                  </span>
                </div>
                <div className="text-[#C5C3C4]/60 truncate text-[10px]">
                  {user.email}
                </div>
                <div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium
                  ${user.role === "Admin" ? "bg-[#4B3A70]/40 text-[#B7A2C9]" : user.role === "Editor" ? "bg-sky-500/15 text-sky-400" : "bg-[#322F42] text-[#C5C3C4]/60"}`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="text-[#C5C3C4]/70">
                  {user.storage}
                </div>
                <div className="text-[#C5C3C4]/70">
                  {user.files}
                </div>
                <div className="text-[#C5C3C4]/60 text-[10px]">
                  {user.lastLogin}
                </div>
                <div>
                  {user.mfa ? (
                    <span className="text-[10px] text-green-400 flex items-center gap-0.5">
                      <ShieldCheck size={9} /> Enabled
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
                      <AlertTriangle size={9} /> Off
                    </span>
                  )}
                </div>
                <div>
                  <button
                    onClick={() =>
                      setUsers((us) =>
                        us.map((u) =>
                          u.id === user.id
                            ? {
                                ...u,
                                status:
                                  u.status === "active"
                                    ? "inactive"
                                    : "active",
                              }
                            : u,
                        ),
                      )
                    }
                    className={`text-[10px] px-2 py-0.5 rounded font-medium transition-colors ${user.status === "active" ? "bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400" : "bg-red-500/15 text-red-400 hover:bg-green-500/15 hover:text-green-400"}`}
                  >
                    {user.status === "active"
                      ? "Active"
                      : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
        </div>

        {/* System monitoring */}
        <div className="bg-[#322F42]/40 rounded-xl border border-[#B7A2C9]/08 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#B7A2C9]/08">
            <Server size={14} className="text-[#B7A2C9]" />
            <span className="text-white font-medium text-sm">
              System monitoring
            </span>
            <span className="ml-auto text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-medium">
              1 degraded
            </span>
          </div>
          {systemStatusItems.map((svc) => (
            <div
              key={svc.name}
              className="flex items-center justify-between px-4 py-2.5 border-b border-[#B7A2C9]/05 last:border-0 hover:bg-[#B7A2C9]/04 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${svc.status === "operational" ? "bg-green-400" : "bg-amber-400"}`}
                />
                <span className="text-white text-xs font-medium">
                  {svc.name}
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-[#C5C3C4]/60">
                <span>Latency: {svc.latency}</span>
                <span>Uptime: {svc.uptime}</span>
                <StatusBadge status={svc.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Notifications View ────────────────────────────────────────────────────────
const notifIcon = (type: string) => {
  if (type === "share")
    return <Share2 size={14} className="text-[#B7A2C9]" />;
  if (type === "download")
    return <Download size={14} className="text-sky-400" />;
  if (type === "alert")
    return <AlertTriangle size={14} className="text-red-400" />;
  if (type === "expiry")
    return <Clock size={14} className="text-amber-400" />;
  if (type === "upload")
    return <Upload size={14} className="text-green-400" />;
  return <Bell size={14} className="text-[#C5C3C4]/60" />;
};

function NotificationsView() {
  const [notifs, setNotifs] = useState(NOTIFS_DATA);
  const [search, setSearch] = useState("");
  const unread = notifs.filter((n) => !n.read).length;
  const markAll = () =>
    setNotifs((n) => n.map((x) => ({ ...x, read: true })));

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Notifications"
        search={search}
        setSearch={setSearch}
        actions={
          unread > 0 ? (
            <button
              onClick={markAll}
              className="text-xs text-[#B7A2C9] hover:text-white transition-colors flex items-center gap-1"
            >
              <Check size={12} /> Mark all read
            </button>
          ) : undefined
        }
      />
      <div className="flex-1 overflow-auto p-5 space-y-2">
        {notifs
          .filter((n) =>
            n.title
              .toLowerCase()
              .includes(search.toLowerCase()),
          )
          .map((notif) => (
            <div
              key={notif.id}
              onClick={() =>
                setNotifs((ns) =>
                  ns.map((n) =>
                    n.id === notif.id
                      ? { ...n, read: true }
                      : n,
                  ),
                )
              }
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors
              ${notif.read ? "bg-[#322F42]/30 border-[#B7A2C9]/06 hover:border-[#B7A2C9]/12" : "bg-[#322F42]/70 border-[#4B3A70]/30 hover:border-[#4B3A70]/50"}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${notif.read ? "bg-[#212531]" : "bg-[#4B3A70]/30"}`}
              >
                {notifIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-sm font-medium leading-snug ${notif.read ? "text-[#C5C3C4]/70" : "text-white"}`}
                  >
                    {notif.title}
                  </p>
                  {!notif.read && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4B3A70] shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                  {notif.desc}
                </p>
                <p className="text-[#C5C3C4]/35 text-[10px] mt-1.5">
                  {notif.time}
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

// ─── Notif Prefs Panel ─────────────────────────────────────────────────────────
const NOTIF_PREFS = [
  {
    label: "File downloads",
    desc: "When someone downloads your shared files",
    defaultOn: true,
  },
  {
    label: "New shares",
    desc: "When someone shares a file with you",
    defaultOn: true,
  },
  {
    label: "Security alerts",
    desc: "Failed login attempts and suspicious activity",
    defaultOn: true,
  },
  {
    label: "Storage warnings",
    desc: "When you approach your storage limit",
    defaultOn: false,
  },
  {
    label: "Weekly digest",
    desc: "A weekly summary of your account activity",
    defaultOn: false,
  },
  {
    label: "Email notifications",
    desc: "Receive all alerts to alex@acme.com",
    defaultOn: true,
  },
  {
    label: "Expiration reminders",
    desc: "24-hour warning before share links expire",
    defaultOn: true,
  },
];

function NotifPrefsPanel() {
  const [enabled, setEnabled] = useState(() =>
    Object.fromEntries(
      NOTIF_PREFS.map((p) => [p.label, p.defaultOn]),
    ),
  );
  return (
    <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Mail size={14} className="text-[#B7A2C9]" />
        <h3 className="text-white font-medium text-sm">
          Notification preferences
        </h3>
      </div>
      {NOTIF_PREFS.map(({ label, desc }) => (
        <div
          key={label}
          className="flex items-center justify-between py-2 border-b border-[#B7A2C9]/06 last:border-0"
        >
          <div>
            <p className="text-white text-xs font-medium">
              {label}
            </p>
            <p className="text-[#C5C3C4]/50 text-[11px] mt-0.5">
              {desc}
            </p>
          </div>
          <button
            onClick={() =>
              setEnabled((e) => ({ ...e, [label]: !e[label] }))
            }
            className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${enabled[label] ? "bg-[#4B3A70]" : "bg-[#212531] border border-[#B7A2C9]/20"}`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${enabled[label] ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Settings View ─────────────────────────────────────────────────────────────
function SettingsView() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [sessions, setSessions] = useState(SESSIONS_DATA);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const tabs = [
    "profile",
    "security",
    "sessions",
    "keys",
    "notifications",
    "storage",
  ];

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Settings"
        search={search}
        setSearch={setSearch}
      />
      <div className="flex-1 overflow-auto p-5">
        <div className="max-w-2xl">
          <div className="flex gap-1 flex-wrap bg-[#322F42]/40 rounded-xl p-1 mb-6 border border-[#B7A2C9]/08 w-fit">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${activeTab === t ? "bg-[#4B3A70] text-white" : "text-[#C5C3C4]/60 hover:text-[#C5C3C4]"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "profile" && (
            <div className="space-y-5">
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <h3 className="text-white font-medium text-sm mb-4">
                  Profile Information
                </h3>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-[#4B3A70] flex items-center justify-center text-white text-lg font-bold">
                    AC
                  </div>
                  <div>
                    <button className="text-xs text-[#B7A2C9] hover:text-white transition-colors">
                      Change avatar
                    </button>
                    <p className="text-[#C5C3C4]/40 text-[10px] mt-0.5">
                      JPG, PNG or GIF · max 2MB
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ["Full name", "Alex Chen"],
                    ["Email", "alex@acme.com"],
                    ["Job title", "Engineering Lead"],
                    ["Department", "Engineering"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <label className="text-xs text-[#C5C3C4]/60 font-medium mb-1.5 block">
                        {label}
                      </label>
                      <input
                        defaultValue={val}
                        className="w-full px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#4B3A70]/60 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
              <button className="px-4 py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors">
                Save changes
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <h3 className="text-white font-medium text-sm mb-4">
                  Change password
                </h3>
                <div className="space-y-3">
                  <div className="space-y-3">
                <div>
                  <label className="text-xs text-[#C5C3C4]/60 font-medium mb-1.5 block">
                    Current password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#C5C3C4]/60 font-medium mb-1.5 block">
                    New password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#C5C3C4]/60 font-medium mb-1.5 block">
                      Confirm new password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#212531] border border-[#B7A2C9]/15 rounded-lg text-xs text-white"
                  />
                </div>

                </div>
                <button className="mt-4 px-4 py-2 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors">
                  Update password
                </button>
              </div>
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      Two-factor authentication (TOTP)
                    </h3>
                    <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                      Authenticator app required on every login
                    </p>
                  </div>
                  <span className="px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-xs font-medium">
                    Enabled
                  </span>
                </div>
                <div className="bg-[#212531]/60 rounded-lg p-3 space-y-1.5 text-xs text-[#C5C3C4]/60">
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={11}
                      className="text-green-400"
                    />{" "}
                    Authenticator app configured
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle
                      size={11}
                      className="text-green-400"
                    />{" "}
                    8 recovery codes remaining
                  </div>
                </div>
                <button className="mt-3 text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Regenerate recovery codes
                </button>
              </div>
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      OAuth2 / SSO connections
                    </h3>
                    <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                      Sign in with external identity providers
                    </p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    {
                      name: "Google Workspace",
                      connected: true,
                    },
                    {
                      name: "Microsoft Entra",
                      connected: false,
                    },
                  ].map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between px-3 py-2.5 bg-[#212531]/60 rounded-lg"
                    >
                      <span className="text-white text-xs">
                        {p.name}
                      </span>
                      <button
                        className={`text-xs px-3 py-1 rounded font-medium transition-colors ${p.connected ? "bg-green-500/15 text-green-400 hover:bg-red-500/15 hover:text-red-400" : "bg-[#4B3A70] hover:bg-[#5C4A84] text-white"}`}
                      >
                        {p.connected ? "Connected" : "Connect"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sessions" && (
            <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium text-sm">
                    Active sessions
                  </h3>
                  <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                    JWT tokens currently valid — click to revoke
                  </p>
                </div>
                <button
                  onClick={() =>
                    setSessions((s) =>
                      s.filter((x) => x.current),
                    )
                  }
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Revoke all others
                </button>
              </div>
              <div className="space-y-3">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${session.current ? "bg-[#4B3A70]/15 border-[#4B3A70]/30" : "bg-[#212531]/60 border-[#B7A2C9]/08"}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${session.current ? "bg-[#4B3A70]/40" : "bg-[#322F42]"}`}
                      >
                        <Smartphone
                          size={14}
                          className={
                            session.current
                              ? "text-[#B7A2C9]"
                              : "text-[#C5C3C4]/50"
                          }
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-white text-xs font-medium">
                            {session.device}
                          </p>
                          {session.current && (
                            <span className="text-[10px] bg-[#4B3A70]/40 text-[#B7A2C9] px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-[#C5C3C4]/50 text-[10px] mt-0.5">
                          {session.location} · {session.ip} ·{" "}
                          {session.lastActive}
                        </p>
                      </div>
                    </div>
                    {!session.current && (
                      <button
                        onClick={() =>
                          setSessions((s) =>
                            s.filter(
                              (x) => x.id !== session.id,
                            ),
                          )
                        }
                        className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                      >
                        <Ban size={11} /> Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "keys" && (
            <div className="space-y-4">
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-1">
                  <Key size={14} className="text-[#B7A2C9]" />
                  <h3 className="text-white font-medium text-sm">
                    Encryption key management
                  </h3>
                </div>
                <p className="text-[#C5C3C4]/50 text-xs mb-4">
                  Unique AES-256-GCM key per file. Keys are
                  managed server-side and never exposed to
                  users.
                </p>
                <div className="space-y-2">
                  {ENC_KEYS_DATA.map((key) => (
                    <div
                      key={key.id}
                      className="flex items-center justify-between px-3 py-2.5 bg-[#212531]/60 rounded-lg"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Lock
                          size={12}
                          className="text-[#B7A2C9] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-white text-[11px] font-mono">
                            {key.id}
                          </p>
                          <p className="text-[#C5C3C4]/50 text-[10px] truncate">
                            {key.file} · {key.algorithm}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 text-[10px] text-[#C5C3C4]/50">
                        <span>Rotated: {key.rotated}</span>
                        <span
                          className={`px-1.5 py-0.5 rounded font-medium ${key.status === "active" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}
                        >
                          {key.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5">
                    <RotateCcw size={11} /> Rotate all keys
                  </button>
                  <button className="px-4 py-2 border border-[#B7A2C9]/20 text-[#C5C3C4] hover:border-[#B7A2C9]/40 rounded-lg text-xs font-medium transition-colors">
                    Export key audit log
                  </button>
                </div>
              </div>
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <h3 className="text-white font-medium text-sm mb-3">
                  API access tokens
                </h3>
                <div className="flex items-center justify-between px-3 py-2.5 bg-[#212531]/60 rounded-lg mb-2">
                  <div>
                    <p className="text-white text-xs font-mono">
                      ts_live_a3f5c7d...
                    </p>
                    <p className="text-[#C5C3C4]/50 text-[10px] mt-0.5">
                      Created Jan 1, 2024 · last used today
                    </p>
                  </div>
                  <button className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Revoke
                  </button>
                </div>
                <button className="mt-2 flex items-center gap-1.5 text-xs text-[#B7A2C9] hover:text-white transition-colors">
                  <Plus size={12} /> Generate new token
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && <NotifPrefsPanel />}

          {activeTab === "storage" && (
            <div className="space-y-4">
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <h3 className="text-white font-medium text-sm mb-4">
                  Storage usage
                </h3>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-[#C5C3C4]/60">
                    412 GB used of 500 GB
                  </span>
                  <span className="text-[#B7A2C9] font-medium">
                    82%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-[#212531]">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: "82%",
                      background:
                        "linear-gradient(to right, #4B3A70, #B7A2C9)",
                    }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {[
                    ["Documents", "124 GB", "#60A5FA"],
                    ["Media", "198 GB", "#22C55E"],
                    ["Archives", "90 GB", "#F59E0B"],
                  ].map(([type, size, color]) => (
                    <div
                      key={type}
                      className="p-3 bg-[#212531]/60 rounded-lg"
                    >
                      <div
                        className="w-2 h-2 rounded-full mb-2"
                        style={{ background: color }}
                      />
                      <p className="text-white text-xs font-medium">
                        {type}
                      </p>
                      <p className="text-[#C5C3C4]/50 text-[11px]">
                        {size}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium text-sm">
                      Enterprise plan
                    </h3>
                    <p className="text-[#C5C3C4]/50 text-xs mt-0.5">
                      500 GB · 50 seats · AES-256 encryption ·
                      Priority support
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg text-xs font-medium transition-colors">
                    Upgrade
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Placeholder ───────────────────────────────────────────────────────────────
function PlaceholderView({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <div className="w-14 h-14 rounded-2xl bg-[#322F42] border border-[#B7A2C9]/10 flex items-center justify-center mb-4">
        <Icon size={22} className="text-[#B7A2C9]" />
      </div>
      <h3 className="text-white font-semibold text-sm mb-1.5">
        {title}
      </h3>
      <p className="text-[#C5C3C4]/50 text-xs max-w-xs leading-relaxed">
        {desc}
      </p>
    </div>
  );
}

// ─── App Shell ─────────────────────────────────────────────────────────────────
function AppShell() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [tab, setTab] = useState<AppTab>("files");

  const handleSignOut = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  const [showUpload, setShowUpload] = useState(false);
  const [shareFile, setShareFile] = useState<
    (typeof FILES_DATA)[0] | null
  >(null);
  const unread = NOTIFS_DATA.filter((n) => !n.read).length;

  return (
    <div
      className="flex h-screen bg-[#212531] overflow-hidden"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <Sidebar
        tab={tab}
        setTab={setTab}
        onSignOut={handleSignOut}
        unread={unread}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        {tab === "files" && (
          <FilesView
            onUpload={() => setShowUpload(true)}
            onShare={(f) => setShareFile(f)}
          />
        )}
        {tab === "shared" && (
          <div className="flex flex-col h-full">
            <TopBar
              title="Shared with me"
              search=""
              setSearch={() => {}}
            />
            <PlaceholderView
              icon={Share2}
              title="Files shared with you"
              desc="Files and folders that others have shared with you appear here."
            />
          </div>
        )}
        {tab === "recent" && (
          <div className="flex flex-col h-full">
            <TopBar
              title="Recent"
              search=""
              setSearch={() => {}}
            />
            <PlaceholderView
              icon={Clock}
              title="Recent files"
              desc="Files you've viewed or edited recently will appear here."
            />
          </div>
        )}
        {tab === "starred" && (
          <div className="flex flex-col h-full">
            <TopBar
              title="Starred"
              search=""
              setSearch={() => {}}
            />
            <PlaceholderView
              icon={Star}
              title="Starred files"
              desc="Files you've starred for quick access will appear here."
            />
          </div>
        )}
        {tab === "trash" && (
          <div className="flex flex-col h-full">
            <TopBar
              title="Trash"
              search=""
              setSearch={() => {}}
            />
            <PlaceholderView
              icon={Trash2}
              title="Trash is empty"
              desc="Deleted files appear here and are permanently removed after 30 days."
            />
          </div>
        )}
        {tab === "shares" && <SharesView />}
        {tab === "analytics" && <AnalyticsView />}
        {tab === "auditlog" && <AuditLogView />}
        {tab === "security" && <SecurityView />}
        {tab === "admin" && <AdminView />}
        {tab === "notifications" && <NotificationsView />}
        {tab === "settings" && <SettingsView />}
      </main>
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} />
      )}
      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
        />
      )}
    </div>
  );
}

// ─── Root ───────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/signin"
          element={
            <GuestOnlyRoute>
              <SignIn />
            </GuestOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestOnlyRoute>
              <SignUp />
            </GuestOnlyRoute>
          }
        />
        <Route path="/mfa" element={<MFAVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}