import { Search, Bell } from "lucide-react";
import "./Header.css";

export default function Header({search,setSearch,setShowShareModal,}) {
  return (
    <div className="dashboard-header">

      <h2 className="page-title">Admin Panel</h2>

      <div className="header-right">

        <div className="search-box">
          <Search size={18} />
          <input
            
  type="text"
  placeholder="Search files, users..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
          
        </div>

        <button className="icon-btn">
          <Bell size={18}/>
        </button>

        <div className="profile">
          <div className="avatar">SM</div>

          <div>
            <h4>Sarah Mitchell</h4>
            <span>Administrator</span>
          </div>
        </div>

        <button
  className="share-btn"
  onClick={() => setShowShareModal(true)}
>
  Share
</button>
      </div>

    </div>
  );
}