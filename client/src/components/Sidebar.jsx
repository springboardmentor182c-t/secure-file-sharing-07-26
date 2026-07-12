import { LayoutDashboard, Folder, Link2, Trash2, Shield, ClipboardList, ShieldAlert, Settings, User, HardDrive, LogOut } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ users }) {
  const admin = users?.find((u) => u.role === "Admin");
  const [active, setActive] = useState("Dashboard");

  const mainLinks = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "My Files", icon: Folder },
    { name: "Shared Files", icon: Link2 },
    { name: "Trash", icon: Trash2 },
  ];

  const securityLinks = [
    { name: "Monitoring", icon: Shield },
    { name: "Audit Logs", icon: ClipboardList },
    { name: "Security", icon: ShieldAlert },
  ];

  const accountLinks = [
    { name: "Settings", icon: Settings },
    { name: "Profile", icon: User },
  ];

  const NavItem = ({ name, icon: Icon }) => {
    const isActive = active === name;
    return (
      <div
        onClick={() => setActive(name)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? "bg-purple-600/20 text-white border-l-2 border-purple-500"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon size={18} />
        <span className="text-sm">{name}</span>
      </div>
    );
  };

  return (
    <div className="w-64 bg-[#13131a] h-screen sticky top-0 flex flex-col justify-between border-r border-gray-800">
      <div className="overflow-y-auto flex-1 px-3 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center font-bold text-white">
            T
          </div>
          <div>
            <p className="text-white font-semibold text-sm">TrustShare</p>
            <p className="text-gray-500 text-xs">Secure File Sharing</p>
          </div>
        </div>

        {/* Main section */}
        <p className="text-gray-500 text-xs px-4 mb-2 mt-4">MAIN</p>
        <div className="space-y-1">
          {mainLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>

        {/* Security section */}
        <p className="text-gray-500 text-xs px-4 mb-2 mt-6">SECURITY</p>
        <div className="space-y-1">
          {securityLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>

        {/* Account section */}
        <p className="text-gray-500 text-xs px-4 mb-2 mt-6">ACCOUNT</p>
        <div className="space-y-1">
          {accountLinks.map((link) => (
            <NavItem key={link.name} {...link} />
          ))}
        </div>
      </div>

      {/* Storage widget */}
      <div className="px-4 pb-4">
        <div className="bg-[#1a1a22] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <HardDrive size={16} className="text-purple-400" />
              Storage
            </div>
            <span className="text-gray-400 text-xs">82%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: "82%" }} />
          </div>
          <p className="text-gray-500 text-xs">412 GB / 500 GB Used</p>
        </div>

        {/* User profile */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center font-semibold text-white text-sm">
             {admin?.name ? admin.name.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() : "AD"}
            </div>
            <div>
              <p className="text-white text-sm">{admin?.name || "Admin"}</p>
              <p className="text-gray-500 text-xs">{admin?.role || "Admin"}</p>
            </div>
          </div>
          <LogOut size={16} className="text-gray-500 cursor-pointer hover:text-white" />
        </div>
      </div>
    </div>
  );
}