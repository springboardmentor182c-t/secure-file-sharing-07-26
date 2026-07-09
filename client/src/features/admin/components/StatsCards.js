import { UsersIcon, DatabaseIcon, FileIcon, LinkIcon } from './icons'
import './StatsCards.css'

const ICONS = {
  users: UsersIcon,
  database: DatabaseIcon,
  file: FileIcon,
  link: LinkIcon,
}

export default function StatsCards({ stats }) {
  return (
    <div className="admin-stats-grid">
      {stats.map((stat) => {
        const Icon = ICONS[stat.icon]
        return (
          <div className="admin-stat-card" key={stat.id}>
            <div className="admin-stat-card-top">
              <span>{stat.label}</span>
              <span className="admin-stat-card-icon">
                <Icon />
              </span>
            </div>
            <div className="admin-stat-card-value">{stat.value}</div>
            <div className="admin-stat-card-caption">{stat.caption}</div>
          </div>
        )
      })}
    </div>
  )
}
