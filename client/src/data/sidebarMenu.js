import {
  LayoutDashboard,
  FolderOpen,
  Link2,
  Share2,
  Trash2,
  Shield,
  ClipboardList,
  ShieldAlert,
  Settings,
  User,
  BarChart3,
  Bell,
  Users,
  Clock,
  Star,
} from "lucide-react";


export const sidebarMenu = [
  {
    title: "PERSONAL",
    items: [
      {
        name: "My Files",
        path: "/files",
        icon: FolderOpen,
      },
      {
        name: "Shared with me",
        path: "/shared-files",
        icon: Link2,
      },
      {
        name: "Recent",
        path: "/recent",
        icon: Clock,
      },
      {
        name: "Starred",
        path: "/starred",
        icon: Star,
      },
      {
        name: "Trash",
        path: "/trash",
        icon: Trash2,
      },
    ],
  },

  {
    title: "SHARING",
    items: [
      {
        name: "Shared Links",
        path: "/shared-links",
        icon: Share2,
      },
    ],
  },

  {
    title: "MANAGEMENT",
    items: [
      {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
      {
        name: "Audit Log",
        path: "/audit",
        icon: ClipboardList,
      },
      {
        name: "Security",
        path: "/security",
        icon: ShieldAlert,
      },
      {
        name: "Admin",
        path: "/admin",
        icon: Users,
      },
      {
        name: "Notifications",
        path: "/notifications",
        icon: Bell,
      },
    ],
  },

  {
    title: "ACCOUNT",
    items: [
      {
        name: "Settings",
        path: "/settings",
        icon: Settings,
      },
      {
        name: "Profile",
        path: "/profile",
        icon: User,
      },
    ],
  },
];