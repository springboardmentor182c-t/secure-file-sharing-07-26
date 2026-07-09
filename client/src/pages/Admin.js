import { useEffect, useState, useCallback } from 'react'
import AdminSidebar from '../features/admin/components/AdminSidebar'
import AdminHeader from '../features/admin/components/AdminHeader'
import StatsCards from '../features/admin/components/StatsCards'
import StorageChart from '../features/admin/components/StorageChart'
import UserManagementTable from '../features/admin/components/UserManagementTable'
import SystemMonitoring from '../features/admin/components/SystemMonitoring'
import {
  fetchSummary,
  fetchStorageByUser,
  fetchUsers,
  fetchSystemStatus,
  inviteUser,
} from '../features/admin/services/adminApi'
import '../features/admin/admin-theme.css'

export default function Admin() {
  const [summary, setSummary] = useState(null)
  const [storageByUser, setStorageByUser] = useState(null)
  const [users, setUsers] = useState(null)
  const [systemServices, setSystemServices] = useState(null)
  const [error, setError] = useState(null)

  const loadAll = useCallback(async () => {
    setError(null)
    try {
      const [summaryData, storageData, usersData, servicesData] = await Promise.all([
        fetchSummary(),
        fetchStorageByUser(),
        fetchUsers(),
        fetchSystemStatus(),
      ])
      setSummary(summaryData)
      setStorageByUser(storageData)
      setUsers(usersData)
      setSystemServices(servicesData)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  const handleInviteUser = async () => {
    const email = window.prompt("New user's email address:")
    if (!email) return
    try {
      await inviteUser({ email, role: 'Viewer' })
      await loadAll()
    } catch (err) {
      window.alert(`Could not invite user: ${err.message}`)
    }
  }

  const isLoading = !summary || !storageByUser || !users || !systemServices

  return (
    <div className="admin-page">
      <AdminSidebar />
      <main style={{ flex: 1, minWidth: 0 }}>
        <AdminHeader title="Admin Dashboard" onInviteUser={handleInviteUser} />

        {error && (
          <div style={{ padding: '0 30px' }}>
            <p style={{ color: 'var(--admin-red)' }}>Couldn't load the dashboard: {error}</p>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: 13.5 }}>
              Make sure the FastAPI backend is running at{' '}
              <code>http://localhost:8000</code>.
            </p>
            <button type="button" onClick={loadAll}>
              Retry
            </button>
          </div>
        )}

        {!error && isLoading && (
          <div style={{ padding: '0 30px', color: 'var(--admin-text-muted)' }}>Loading…</div>
        )}

        {!error && !isLoading && (
          <>
            <StatsCards stats={summary.stats} />
            <StorageChart data={storageByUser} />
            <UserManagementTable users={users} />
            <SystemMonitoring services={systemServices} />
          </>
        )}
      </main>
    </div>
  )
}
