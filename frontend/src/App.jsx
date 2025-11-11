import React, { useMemo, useState } from 'react'
import UploadForm from './components/UploadForm'
import VideoList from './components/VideoList'
import Login from './components/Login'
import { AuthProvider, useAuth } from './context/AuthContext'

// Frontend-only mode: always use mock data so UI works without a backend.
const USE_MOCK = true

function InnerApp() {
  const { role, user, logout } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey(k => k + 1)

  const friendlyRole = useMemo(() => {
    if (role === 'admin') return 'Administrator'
    if (role === 'editor') return 'Editor'
    if (role === 'viewer') return 'Viewer'
    return 'Guest'
  }, [role])

  const initials = useMemo(() => {
    const source = user?.name || user?.email || 'User'
    return source.split(' ').map(part => part[0]?.toUpperCase()).join('').slice(0, 2)
  }, [user])

  if (!role) return <Login />

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">▶</div>
          <div>
            <h1>Streamboard</h1>
            <p>Monitor uploads, review content, manage your video library.</p>
          </div>
        </div>

        <div className="user-block">
          <div className="user-chip">
            <span className="user-avatar" aria-hidden>{initials}</span>
            <div>
              <strong>{user?.name || user?.email || 'Authenticated user'}</strong>
              <small>{friendlyRole}</small>
            </div>
          </div>
          <button className="btn ghost" onClick={logout}>Sign out</button>
        </div>
      </header>

      <main className={`layout ${role === 'viewer' ? 'viewer-only' : ''}`}>
        {(role === 'admin' || role === 'editor') && (
          <section className="panel accent">
            <UploadForm useMock={USE_MOCK} onUploaded={refresh} />
          </section>
        )}
        <section className="panel">
          <VideoList refreshKey={refreshKey} useMock={USE_MOCK} />
        </section>
      </main>

      <footer>
        <small>UI demo — wire this screen to your backend when ready.</small>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}
