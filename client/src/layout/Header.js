import { useState, useEffect, useRef } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import pageTitles from "../data/pageTitles";
import NotificationBell from "../components/NotificationBell";
import { aiSearch } from "../services/aiSearchService";

function Header({
  setSidebarOpen,
  searchTerm,
  onSearchChange,
  currentUser,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const title = pageTitles[location.pathname] || "TrustShare";
  const inputRef = useRef(null);

  // Global Ctrl + K / Cmd + K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const searchRef = useRef(null);

  useEffect(() => {

    const query = searchTerm.trim();

    if (query.length < 2) {

      setResults([]);

      return;

    }

    const timer = setTimeout(async () => {

      try {

        setLoading(true);

        const data = await aiSearch(query);

        setResults(data || []);

      } catch (error) {

        console.error(error);

        setResults([]);

      } finally {

        setLoading(false);

      }

    }, 400);

    return () => clearTimeout(timer);

  }, [searchTerm]);

  useEffect(() => {

    const handleOutside = (event) => {

      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {

        setResults([]);

      }

    };

    document.addEventListener(
      "mousedown",
      handleOutside
    );

    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutside
      );

    };

  }, []);
  return (
    <header className="h-20 shrink-0 flex items-center justify-between px-6 lg:px-8 bg-[#1E1F2B] border-b border-[#34364A]">
      <div className="flex items-center gap-4">

        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-gray-300 hover:text-white"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        <div>

          <h1 className="text-xl lg:text-2xl font-semibold text-white capitalize">
            {title}
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Home / {title}
          </p>

        </div>

      </div>

      {/* ================= AI SEARCH ================= */}

      <div
        ref={searchRef}
        className="hidden md:block relative w-80 lg:w-[450px]"
      >

        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            bg-[#272938]
            border
            border-[#34364A]
            px-4
            py-3
          "
        >

          <Search
            size={18}
            className="text-gray-400"
          />

          <input
            type="text"
            value={searchTerm}
            placeholder="Search document content using AI..."
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={async (e) => {

              // Close dropdown
              if (e.key === "Escape") {
                setResults([]);
                setSelectedIndex(-1);
                return;
              }

              // Move down
              if (e.key === "ArrowDown") {
                e.preventDefault();

                setSelectedIndex((prev) =>
                  prev < results.length - 1 ? prev + 1 : prev
                );

                return;
              }

              // Move up
              if (e.key === "ArrowUp") {
                e.preventDefault();

                setSelectedIndex((prev) =>
                  prev > 0 ? prev - 1 : 0
                );

                return;
              }

              // Enter
              if (e.key === "Enter") {

                // Open selected result
                if (
                  selectedIndex >= 0 &&
                  results[selectedIndex]
                ) {

                  const item = results[selectedIndex];

                  setResults([]);
                  onSearchChange("");
                  setSelectedIndex(-1);

                  if (item.file_id) {
                    navigate(`/files/${item.file_id}`);
                  }

                  return;
                }

                // Search
                try {

                  setLoading(true);

                  const data = await aiSearch(searchTerm.trim());

                  setResults(data || []);
                  setSelectedIndex(-1);

                } catch (err) {

                  console.error(err);

                } finally {

                  setLoading(false);

                }

              }

            }}
            className="
    flex-1
    bg-transparent
    outline-none
    text-sm
    text-white
    placeholder:text-gray-500
  "
          />

          {searchTerm && (

            <button
              onClick={() => {
                onSearchChange("");
                setResults([]);
                setSelectedIndex(-1);
              }}
              className="
                text-gray-500
                hover:text-white
                transition
              "
            >

              <X size={16} />

            </button>

          )}

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
        {/* ================= Loading ================= */}

        {loading && (
          <div
            className="
              absolute
              left-0
              right-0
              mt-2
              rounded-xl
              bg-[#272938]
              border
              border-[#34364A]
              shadow-2xl
              p-5
              z-50
            "
          >
            <div className="flex items-center justify-center gap-3">

              <Loader2
                size={18}
                className="animate-spin text-blue-400"
              />

              <span className="text-gray-300 text-sm">
                Searching documents...
              </span>

            </div>
          </div>
        )}

        {/* ================= Results ================= */}

        {!loading && results.length > 0 && (
          <div
            className="
              absolute
              left-0
              right-0
              mt-2
              rounded-xl
              bg-[#272938]
              border
              border-[#34364A]
              shadow-2xl
              overflow-hidden
              max-h-[430px]
              overflow-y-auto
              z-50
            "
          >

            {results.map((item, index) => (

              <button
                onMouseEnter={() =>
                  setSelectedIndex(index)
                }
                key={index}
                type="button"
                onClick={() => {

                  setResults([]);
                  setSelectedIndex(-1);
                  onSearchChange("");

                  if (item.file_id) {
                    navigate(`/files/${item.file_id}`);
                  } else {
                    console.log(item);
                  }

                }}
                className={`
  w-full
  text-left
  p-4
  border-b
  border-[#34364A]
  transition-all
  ${selectedIndex === index
                    ? "bg-[#34364A]"
                    : "hover:bg-[#34364A]"
                  }
`}
              >

                <div className="flex justify-between items-start">

                  <div className="flex items-start gap-3 flex-1">

                    <div
                      className="
                        h-10
                        w-10
                        rounded-lg
                        bg-blue-500/20
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <FileText
                        size={18}
                        className="text-blue-400"
                      />

                    </div>

                    <div className="flex-1">

                      <h3 className="text-white font-semibold">

                        {item.file_name}

                      </h3>

                      <p
                        className="
    mt-2
    text-xs
    text-gray-400
    line-clamp-2
  "
                      >
                        {item.text}
                      </p>

                      <p
                        className="
    mt-2
    text-xs
    text-blue-400
    font-medium
  "
                      >
                        Click to open →
                      </p>

                    </div>

                  </div>

                  <div
                    className="
                      ml-4
                      bg-green-500/20
                      text-green-400
                      rounded-full
                      px-3
                      py-1
                      text-xs
                      font-semibold
                      whitespace-nowrap
                    "
                  >
                    ⭐ {(item.score * 100).toFixed(1)}%
                  </div>

                </div>

              </button>

            ))}

          </div>
        )}
        {/* ================= No Results ================= */}

        {!loading &&
          searchTerm.trim().length >= 2 &&
          results.length === 0 && (

            <div
              className="
              absolute
              left-0
              right-0
              mt-2
              rounded-xl
              bg-[#272938]
              border
              border-[#34364A]
              shadow-2xl
              p-6
              z-50
            "
            >

              <div className="flex flex-col items-center">

                <Search
                  size={34}
                  className="text-gray-500 mb-3"
                />

                <h3
                  className="
                  text-white
                  font-semibold
                  text-base
                "
                >
                  No AI search results found
                </h3>

                <p
                  className="
                  mt-2
                  text-center
                  text-sm
                  text-gray-400
                "
                >
                  Try another keyword, file name,
                  or a sentence from your document.
                </p>

              </div>

            </div>

          )}

      </div>

      {/* ================= Right Section ================= */}

      <div className="flex items-center gap-3 lg:gap-5">

        <NotificationBell />

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
            transition-all
          "
        >

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
            {currentUser?.name
              ? currentUser.name.charAt(0).toUpperCase()
              : "X"}
          </div>

          <div className="hidden lg:block">

            <p className="text-sm font-medium text-white">
              {currentUser?.name || "XYZ"}
            </p>

            <p className="text-xs text-gray-400">
              {currentUser?.role || "Engineering Lead"}
            </p>

          </div>

          <ChevronDown
            size={18}
            className="text-gray-400"
          />

        </button>

      </div>
    </header>
  );
}

export default Header;
