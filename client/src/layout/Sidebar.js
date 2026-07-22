import { LayoutDashboard, Folder, Link2, Trash2, Shield, ClipboardList, ShieldAlert, Settings, User, HardDrive, LogOut,Clock  } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ users, stats }) {
  const admin = users?.find((u) => u.role === "Admin");
  const location = useLocation();

  const mainLinks = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "My Files", path: "/files", icon: Folder },
    { name: "Shared Files", path: "/shared-files", icon: Link2 },
    { name: "Recent", path: "/recent", icon: Clock },

    { name: "Trash", path: "/trash", icon: Trash2 },
  ];

  const securityLinks = [
    { name: "Monitoring", path: "/monitoring", icon: Shield },
    { name: "Audit Logs", path: "/audit", icon: ClipboardList },
    { name: "Security", path: "/security", icon: ShieldAlert },
  ];

  const accountLinks = [
    { name: "Settings", path: "/settings", icon: Settings },
    { name: "Profile", path: "/profile", icon: User },
  ];

  const NavItem = ({ name, path, icon: Icon }) => {
    const isActive = location.pathname === path;
    return (
      <Link
        to={path}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? "bg-purple-600/20 text-white border-l-2 border-purple-500"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon size={18} />
        <span className="text-sm">{name}</span>
      </Link>
    );
  };

  const storagePercent = stats
    ? Math.min((stats.total_storage_gb / stats.total_storage_limit_gb) * 100, 100)
    : 0;

  return (
    <div className="w-64 bg-[#13131a] h-screen sticky top-0 flex flex-col justify-between border-r border-gray-800">
      <div className="overflow-y-auto flex-1 px-3 py-4">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
            T
          </div>
          <div>
            <p className="text-white font-semibold text-sm">TrustShare</p>
            <p className="text-gray-500 text-xs">Secure File Sharing</p>
          </div>
        </div>

        <p className="text-gray-500 text-xs px-4 mb-2 mt-4">MAIN</p>
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>

        <p className="text-gray-500 text-xs px-4 mb-2 mt-6">SECURITY</p>
        <div className="space-y-1">
          {securityLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>

        <p className="text-gray-500 text-xs px-4 mb-2 mt-6">ACCOUNT</p>
        <div className="space-y-1">
          {accountLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="bg-[#1a1a22] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <HardDrive size={16} className="text-purple-400" />
              Storage
            </div>
            <span className="text-gray-400 text-xs">
              {stats ? `${Math.round(storagePercent)}%` : "..."}
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div
              className="bg-purple-500 h-2 rounded-full"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="text-gray-500 text-xs">
            {stats
              ? `${stats.total_storage_gb.toFixed(0)} GB / ${stats.total_storage_limit_gb} GB Used`
              : "Loading..."}
          </p>
        </div>

      {/* User Section */}

      <div
        className="
          mt-6
          border-t
          border-[#34364A]
          p-5
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
          "
        >
          <div
            className="
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-11
                w-11
                rounded-full
                bg-[#7C5CFC]
                flex
                items-center
                justify-center
                text-white
                font-bold
              "
            >
              X
            </div>
            <div>
              <h3
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                XYZ
              </h3>

              <p
                className="
                  text-xs
                  text-gray-400
                "
              >
                Engineering Lead
              </p>
            </div>
          </div>
          <LogOut size={16} className="text-gray-500 cursor-pointer hover:text-white" />
        </div>
      </div>
    </div>
    </div>
  );
}

