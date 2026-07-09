import "./Navbar.css";
import { FaBell } from "react-icons/fa";

function Navbar() {
  return (
    <div className="navbar">

      <h2>Secure File Sharing Platform</h2>

      <div className="right">

        <input
          type="text"
          placeholder="Search files, users..."
        />

        <button>

          <FaBell />

        </button>

        <div className="profile">

          <div className="avatar">

            SM

          </div>

          <div>

            <h4>Sarah Mitchell</h4>

            <p>Administrator</p>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Navbar;