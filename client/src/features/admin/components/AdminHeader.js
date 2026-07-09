import { SearchIcon, UserPlusIcon } from './icons'
import './AdminHeader.css'

export default function AdminHeader({ title, onInviteUser }) {
  return (
    <header className="admin-header">
      <h1 className="admin-header-title">{title}</h1>
      <div className="admin-header-actions">
        <div className="admin-search">
          <SearchIcon />
          <input type="text" placeholder="Search..." aria-label="Search" />
        </div>
        <button type="button" className="admin-invite-btn" onClick={onInviteUser}>
          <UserPlusIcon />
          Invite user
        </button>
      </div>
    </header>
  )
}
