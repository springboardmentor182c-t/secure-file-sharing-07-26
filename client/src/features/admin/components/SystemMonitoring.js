import { ServerIcon } from './icons'
import Badge from './Badge'
import './admin-panels.css'
import './SystemMonitoring.css'

export default function SystemMonitoring({ services }) {
  const degradedCount = services.filter((s) => s.status === 'Degraded').length

  return (
    <section className="admin-panel">
      <div className="admin-panel-header">
        <div className="admin-panel-header-title">
          <ServerIcon />
          <h2 className="admin-panel-title" style={{ margin: 0 }}>
            System monitoring
          </h2>
        </div>
        {degradedCount > 0 && <Badge tone="amber">{degradedCount} degraded</Badge>}
      </div>

      <div className="admin-service-list">
        {services.map((service) => (
          <div className="admin-service-row" key={service.id}>
            <div className="admin-service-name">
              <span className={`admin-service-dot admin-service-dot-${service.status.toLowerCase()}`} />
              {service.name}
            </div>
            <div className="admin-service-metrics">
              <span>Latency: {service.latency_ms}ms</span>
              <span>Uptime: {service.uptime_pct}%</span>
              <Badge tone={service.status === 'Operational' ? 'green' : 'amber'}>
                {service.status}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
