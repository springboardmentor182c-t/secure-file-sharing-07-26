import { CheckCircleIcon, AlertTriangleIcon } from './icons'
import Badge from './Badge'
import { formatStorage, formatRelativeTime } from '../utils'
import './admin-panels.css'
import './UserManagementTable.css'

const ROLE_TONE = { Admin: 'purple', Editor: 'blue', Viewer: 'gray' }

export default function UserManagementTable({ users }) {
  const activeCount = users.filter((u) => u.status === 'Active').length

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <h2 className="admin-panel-title" style={{ margin: 0 }}>
          User management
        </h2>
        <span className="admin-panel-header-meta">{activeCount} active</span>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-user-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Storage</th>
              <th>Files</th>
              <th>Last login</th>
              <th>MFA</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div className="admin-user-cell">
                    <span className="admin-user-avatar">{user.initials}</span>
                    <span>{user.name}</span>
                  </div>
                </td>
                <td className="admin-text-muted">{user.email}</td>
                <td>
                  <Badge tone={ROLE_TONE[user.role]}>{user.role}</Badge>
                </td>
                <td>{formatStorage(user.storage_used_mb)}</td>
                <td>{user.file_count}</td>
                <td className="admin-text-muted">{formatRelativeTime(user.last_login_at)}</td>
                <td>
                  {user.mfa_enabled ? (
                    <Badge tone="green" icon={CheckCircleIcon}>
                      Enabled
                    </Badge>
                  ) : (
                    <Badge tone="amber" icon={AlertTriangleIcon}>
                      Off
                    </Badge>
                  )}
                </td>
                <td>
                  <Badge tone={user.status === 'Active' ? 'green' : 'red'}>{user.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
