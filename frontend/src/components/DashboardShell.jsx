import BrandHeader from './BrandHeader.jsx'

export default function DashboardShell({ user, onLogout, children }) {
  const displayName = user?.name || user?.email || 'Account'

  return (
    <div className="app-shell app-shell-light dashboard-shell">
      <div className="app-background" aria-hidden="true" />

      <aside className="dashboard-sidebar">
        <BrandHeader />

        <nav className="sidebar-nav" aria-label="Dashboard navigation">
          <a className="sidebar-link active" href="#overview">
            Overview
          </a>
          <a className="sidebar-link" href="#subscriptions">
            Subscriptions
          </a>
          <a className="sidebar-link" href="#insights">
            Insights
          </a>
        </nav>

        <div className="sidebar-usercard">
          <span className="muted">Signed in as</span>
          <strong className="dashboard-user-name">{displayName}</strong>
          {user?.email ? <span className="dashboard-user-email">{user.email}</span> : null}
          <button type="button" className="ghost-button sidebar-logout" onClick={onLogout}>
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>Overview</h1>
          </div>
          <div className="dashboard-topbar-actions">
            <span className="topbar-note">Simple, readable, focused</span>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
