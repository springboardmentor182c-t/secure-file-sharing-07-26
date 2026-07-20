import { NavLink } from "react-router-dom";
import { HardDrive, LogOut, X } from "lucide-react";

import { sidebarMenu } from "../data/sidebarMenu";
import appConfig from "../data/appConfig";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside
      className={`
        fixed
        lg:static
        top-0
        left-0
        z-50
        h-screen
        w-72
        shrink-0
        flex
        flex-col
        bg-[#1B1C28]
        border-r
        border-[#34364A]
        transition-transform
        duration-300

        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}

      `}
    >
      {/* Logo Section */}

      <div
        className="
          h-20
          flex
          items-center
          px-6
          border-b
          border-[#34364A]
        "
      >
        <div
          className="
            h-11
            w-11
            rounded-xl
            bg-[#7C5CFC]
            flex
            items-center
            justify-center
            text-white
            font-bold
            text-xl
          "
        >
          T
        </div>

        <div className="ml-4">
          <h1
            className="
              text-xl
              font-bold
              text-white
            "
          >
            {appConfig.appName}
          </h1>

          <p
            className="
              text-xs
              text-gray-400
            "
          >
            {appConfig.tagline}
          </p>
        </div>

        {/* Mobile Close */}

        <button
          onClick={() => setSidebarOpen(false)}
          className="
            lg:hidden
            ml-auto
            text-gray-400
            hover:text-white
          "
        >
          <X size={22} />
        </button>
      </div>

      {/* Navigation */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-4
          py-6
        "
      >
        {sidebarMenu.map((section) => (
          <div key={section.title} className="mb-8">
            <p
              className="
                  px-2
                  mb-3
                  text-xs
                  uppercase
                  tracking-widest
                  text-gray-500
                "
            >
              {section.title}
            </p>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `

                          relative
                          flex
                          items-center
                          gap-3
                          px-4
                          py-3
                          rounded-xl
                          transition-all
                          duration-200

                          ${
                            isActive
                              ? "bg-[#272938] text-white"
                              : "text-gray-400 hover:bg-[#272938] hover:text-white"
                          }

                          `
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="
                                  absolute
                                  left-0
                                  top-2
                                  h-8
                                  w-1
                                  rounded-r-full
                                  bg-[#7C5CFC]
                                "
                          />
                        )}

                        <Icon size={20} />

                        <span
                          className="
                                font-medium
                              "
                        >
                          {item.name}
                        </span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Storage */}

      <div
        className="
          px-5
        "
      >
        <div
          className="
            rounded-2xl
            bg-[#272938]
            p-4
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
                gap-2
              "
            >
              <HardDrive
                size={18}
                className="
                  text-[#7C5CFC]
                "
              />

              <span
                className="
                  text-sm
                  text-white
                "
              >
                Storage
              </span>
            </div>

            <span
              className="
                text-xs
                text-gray-400
              "
            >
              XX%
            </span>
          </div>

          <div
            className="
              mt-3
              h-2
              rounded-full
              bg-[#1B1C28]
              overflow-hidden
            "
          >
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
            XXX GB / XXX GB Used
          </p>
        </div>
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
                XXX
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

          <button
            className="
              text-gray-400
              hover:text-red-400
              transition
            "
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
