import {
  LayoutDashboard,
  FolderOpen,
  Link2,
  Clock,
  Share2,
  BarChart3,
  Trash2,
  Shield,
  ClipboardList,
  ShieldAlert,
  Settings,
  User,
} from "lucide-react";

export const sidebarMenu = [
  {
    title: "MAIN",
    items: [
      {
        name: "Dashboard",
        path: "/",
        icon: LayoutDashboard,
      },
      {
        name: "My Files",
        path: "/files",
        icon: FolderOpen,
      },
      {
        name: "Shared Files",
        path: "/shared-files",
        icon: Link2,
      },
      {
        name: "Recent",
        path: "/recent",
        icon: Clock,
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
      {
        name: "Analytics",
        path: "/analytics",
        icon: BarChart3,
      },
    ],
  },

  {
    title: "SECURITY",
    items: [
      {
        name: "Monitoring",
        path: "/monitoring",
        icon: Shield,
      },
      {
        name: "Audit Logs",
        path: "/audit",
        icon: ClipboardList,
      },
      {
        name: "Security",
        path: "/security",
        icon: ShieldAlert,
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