import { ShieldCheckIcon } from './icons'
import './AdminSidebar.css'

const NAV_GROUPS = [
  {
    title: 'Personal',
    items: ['My Files', 'Shared with me', 'Recent', 'Starred', 'Trash'],
  },
  {
    title: 'Sharing',
    items: ['Shared Links'],
  },
  {
    title: 'Management',
    items: [
      'Analytics',
      'Audit Log',
      { label: 'Security', badge: 3 },
      { label: 'Admin', active: true },
      { label: 'Notifications', badge: 3 },
    ],
  },
  { title: 'Account', items: ['Settings'] },
]

export default function AdminSidebar({ currentUserName = 'Alex Chen' }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-brand-icon">
          <ShieldCheckIcon />
        </span>
        <span>TrustShare</span>
      </div>

      <div className="admin-sidebar-scroll">
        {NAV_GROUPS.map((group) => (
          <div className="admin-sidebar-group" key={group.title}>
            <div className="admin-sidebar-group-title">{group.title}</div>
            <nav>
              {group.items.map((item) => {
                const label = typeof item === 'string' ? item : item.label
                const active = typeof item === 'object' && item.active
                const badge = typeof item === 'object' ? item.badge : undefined
                return (
                  <button
                    key={label}
                    type="button"
                    className={`admin-sidebar-item${active ? ' is-active' : ''}`}
                  >
                    <span>{label}</span>
                    {badge != null && <span className="admin-sidebar-badge">{badge}</span>}
                  </button>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="admin-sidebar-footer">
        <span className="admin-sidebar-avatar">
          {currentUserName
            .split(' ')
            .map((p) => p[0])
            .join('')
            .toUpperCase()}
        </span>
        <span>{currentUserName}</span>
      </div>
    </aside>
  )
}
