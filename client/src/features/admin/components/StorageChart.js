import './admin-panels.css'
import './StorageChart.css'

const AXIS_MAX_GB = 600
const AXIS_STEPS = [0, 150, 300, 450, 600]

export default function StorageChart({ data }) {
  return (
    <section className="admin-panel">
      <h2 className="admin-panel-title">Storage utilization by user</h2>
      <div className="admin-storage-rows">
        {data.map((row) => (
          <div className="admin-storage-row" key={row.name}>
            <span className="admin-storage-row-name">{row.name}</span>
            <div className="admin-storage-row-track">
              <div
                className="admin-storage-row-fill"
                style={{ width: `${Math.min(100, (row.storage_gb / AXIS_MAX_GB) * 100)}%` }}
                title={`${row.storage_gb} GB`}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="admin-storage-axis">
        {AXIS_STEPS.map((v) => (
          <span key={v}>{v === 0 ? '0 GB' : `${v} GB`}</span>
        ))}
      </div>
    </section>
  )
}
