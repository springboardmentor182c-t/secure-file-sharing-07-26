// Calls the FastAPI backend's /api/admin/* endpoints.
// If you're running client (CRA) on :3000 and the backend on :8000,
// either set "proxy": "http://localhost:8000" in client/package.json
// (CRA's built-in dev proxy), or set REACT_APP_API_BASE in a .env file
// at the client root, e.g. REACT_APP_API_BASE=http://localhost:8000

const BASE = `${process.env.REACT_APP_API_BASE || ''}/api/admin`

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function fetchSummary() {
  return fetch(`${BASE}/summary`).then(handle)
}

export function fetchStorageByUser() {
  return fetch(`${BASE}/storage-by-user`).then(handle)
}

export function fetchUsers() {
  return fetch(`${BASE}/users`).then(handle)
}

export function fetchSystemStatus() {
  return fetch(`${BASE}/system-status`).then(handle)
}

export function inviteUser({ email, role = 'Viewer' }) {
  return fetch(`${BASE}/users/invite`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, role }),
  }).then(handle)
}
