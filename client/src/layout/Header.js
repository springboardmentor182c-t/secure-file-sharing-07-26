import { Menu, Search, Bell, ChevronDown } from "lucide-react";

import { useLocation } from "react-router-dom";
import pageTitles from "../data/pageTitles";

function Header({ setSidebarOpen }) {
  const location = useLocation();

  const title = pageTitles[location.pathname] || "TrustShare";

  return (
    <header
      className="
        h-20
        shrink-0
        flex
        items-center
        justify-between
        px-6
        lg:px-8
        bg-[#1E1F2B]
        border-b
        border-[#34364A]
      "
    >
      {/* Left Section */}

      <div className="flex items-center gap-4">
        {/* Mobile Menu */}

        <button
          onClick={() => setSidebarOpen(true)}
          className="
            lg:hidden
            text-gray-300
            hover:text-white
          "
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Page Title */}

        <div>
          <h1
            className="
              text-xl
              lg:text-2xl
              font-semibold
              text-white
              capitalize
            "
          >
            {title}
          </h1>

          <p
            className="
              text-sm
              text-gray-400
              mt-1
            "
          >
            Home / {title}
          </p>
        </div>
      </div>

      {/* Search */}

      <div
        className="
          hidden
          md:flex
          items-center
          w-72
          lg:w-96
          px-4
          py-2.5
          rounded-xl
          bg-[#272938]
          border
          border-[#34364A]
        "
      >
        <Search size={18} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search files..."
          className="
            ml-3
            flex-1
            bg-transparent
            outline-none
            text-sm
            text-white
            placeholder-gray-500
          "
        />

        <span
          className="
            hidden
            lg:block
            text-xs
            text-gray-500
            border
            border-[#34364A]
            rounded-md
            px-2
            py-1
          "
        >
          Ctrl K
        </span>
      </div>

      {/* Right Section */}

      <div
        className="
          flex
          items-center
          gap-3
          lg:gap-5
        "
      >
        {/* Notification */}

        <button
          className="
            relative
            h-11
            w-11
            rounded-xl
            bg-[#272938]
            border
            border-[#34364A]
            flex
            items-center
            justify-center
            hover:bg-[#34364A]
            transition
          "
          aria-label="Notifications"
        >
          <Bell size={20} className="text-gray-300" />

          <span
            className="
              absolute
              top-2
              right-2
              h-2
              w-2
              rounded-full
              bg-[#7C5CFC]
            "
          />
        </button>

        {/* User Profile */}

        <button
          className="
            flex
            items-center
            gap-3
            rounded-xl
            bg-[#272938]
            border
            border-[#34364A]
            px-3
            py-2
            hover:bg-[#34364A]
            transition
          "
        >
          {/* Avatar */}

          <div
            className="
              h-10
              w-10
              rounded-full
              bg-[#7C5CFC]
              flex
              items-center
              justify-center
              text-white
              font-semibold
            "
          >
            AC
          </div>

          {/* User Info */}

          <div
            className="
              hidden
              lg:block
              text-left
            "
          >
            <p
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Alex Chen
            </p>

            <p
              className="
                text-xs
                text-gray-400
              "
            >
              Engineering Lead
            </p>
          </div>

          <ChevronDown
            size={18}
            className="
              text-gray-400
            "
          />
        </button>
      </div>
    </header>
  );
}

export default Header;