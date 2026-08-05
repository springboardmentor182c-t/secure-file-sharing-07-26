import { HardDrive, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { sidebarMenu } from "../data/sidebarMenu";

function Sidebar({ users, stats }) {
  const admin = users?.find((u) => u.role === "Admin");
  const location = useLocation();

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

        {sidebarMenu.map((section) => (
          <div key={section.title}>
            <p className="text-gray-500 text-xs px-4 mb-2 mt-6">{section.title}</p>
            <div className="space-y-1">
              {section.items.map((link) => (
                <NavItem key={link.name} {...link} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="bg-[#1a1a22] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <HardDrive size={16} className="text-purple-400" />
              Storage
            </div>

            <span
              className="
                text-xs
                text-gray-400
              "
            >
              82%
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
            <div
              className="
                h-full
                w-4/5
                rounded-full
                bg-[#7C5CFC]
              "
            />
          </div>

          <p
            className="
              mt-3
              text-xs
              text-gray-400
            "
          >
            412 GB / 500 GB Used
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
              V
            </div>
            <div>
              <h3
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Vamshi
              </h3>

              <p
                className="
                  text-xs
                  text-gray-400
                "
              >
                Student
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

export default Sidebar;
