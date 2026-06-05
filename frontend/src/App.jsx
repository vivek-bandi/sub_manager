import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

const emptySubscription = {
  name: '',
  price: '',
  billingCycle: 'monthly',
  nextBillingDate: '',
  category: '',
  isActive: true,
}

const emptyAuth = {
  name: '',
  email: '',
  password: '',
}

function formatCurrency(value) {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(numberValue)
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function getTokenFromStorage() {
  return localStorage.getItem('subscription-dashboard-token') ?? ''
}

function getUserFromStorage() {
  const storedUser = localStorage.getItem('subscription-dashboard-user')

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    return null
  }
}

function App() {
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState(emptyAuth)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [token, setToken] = useState(getTokenFromStorage)
  const [user, setUser] = useState(getUserFromStorage)
  const [subscriptions, setSubscriptions] = useState([])
  const [subscriptionForm, setSubscriptionForm] = useState(emptySubscription)
  const [editingId, setEditingId] = useState('')
  const [dashboardMessage, setDashboardMessage] = useState('')
  const [dashboardError, setDashboardError] = useState('')
  const [loadingAuth, setLoadingAuth] = useState(false)
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false)

  const totalMonthlySpend = useMemo(() => {
    return subscriptions.reduce((total, subscription) => {
      if (!subscription?.isActive) {
        return total
      }

      return total + Number(subscription.price || 0)
    }, 0)
  }, [subscriptions])

  const activeCount = subscriptions.filter((subscription) => subscription?.isActive).length

  const apiRequest = useCallback(
    async (path, options = {}) => {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers ?? {}),
        },
        ...options,
      })

      const isJson = response.headers.get('content-type')?.includes('application/json')
      const data = isJson ? await response.json() : null

      if (!response.ok) {
        throw new Error(data?.message || 'Request failed')
      }

      return data
    },
    [token],
  )

  const loadSubscriptions = useCallback(async () => {
    if (!token) {
      return
    }

    setLoadingSubscriptions(true)
    setDashboardError('')

    try {
      const response = await fetch(`${API_BASE}/api/subscriptions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to load subscriptions')
      }

      setSubscriptions(Array.isArray(data) ? data : [])
    } catch (error) {
      setDashboardError(error.message)
    } finally {
      setLoadingSubscriptions(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      return
    }

    queueMicrotask(() => {
      void loadSubscriptions()
    })
  }, [loadSubscriptions, token])

  async function handleAuthSubmit(event) {
    event.preventDefault()
    setLoadingAuth(true)
    setAuthError('')
    setAuthMessage('')

    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup'
    const payload =
      authMode === 'login'
        ? {
            email: authForm.email,
            password: authForm.password,
          }
        : authForm

    try {
      const data = await apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      if (authMode === 'login') {
        localStorage.setItem('subscription-dashboard-token', data.token)
        localStorage.setItem('subscription-dashboard-user', JSON.stringify(data.user))
        setToken(data.token)
        setUser(data.user)
        setAuthMessage('Signed in successfully.')
      } else {
        setAuthMessage(data.message || 'Account created. You can log in now.')
        setAuthMode('login')
      }

      setAuthForm(emptyAuth)
    } catch (error) {
      setAuthError(error.message)
    } finally {
      setLoadingAuth(false)
    }
  }

  async function handleSubscriptionSubmit(event) {
    event.preventDefault()
    setDashboardError('')
    setDashboardMessage('')

    const payload = {
      ...subscriptionForm,
      price: Number(subscriptionForm.price),
      isActive: Boolean(subscriptionForm.isActive),
    }

    try {
      if (editingId) {
        await apiRequest(`/api/subscriptions/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        setDashboardMessage('Subscription updated.')
      } else {
        await apiRequest('/api/subscriptions', {
          method: 'POST',
          body: JSON.stringify(payload),
        })
        setDashboardMessage('Subscription added.')
      }

      setSubscriptionForm(emptySubscription)
      setEditingId('')
      await loadSubscriptions()
    } catch (error) {
      setDashboardError(error.message)
    }
  }

  async function handleDeleteSubscription(id) {
    setDashboardError('')
    setDashboardMessage('')

    try {
      await apiRequest(`/api/subscriptions/${id}`, {
        method: 'DELETE',
      })

      setDashboardMessage('Subscription removed.')
      await loadSubscriptions()
    } catch (error) {
      setDashboardError(error.message)
    }
  }

  function handleEditSubscription(subscription) {
    setEditingId(subscription._id)
    setSubscriptionForm({
      name: subscription.name ?? '',
      price: subscription.price ?? '',
      billingCycle: subscription.billingCycle ?? 'monthly',
      nextBillingDate: subscription.nextBillingDate ? subscription.nextBillingDate.slice(0, 10) : '',
      category: subscription.category ?? '',
      isActive: Boolean(subscription.isActive),
    })
  }

  function handleLogout() {
    localStorage.removeItem('subscription-dashboard-token')
    localStorage.removeItem('subscription-dashboard-user')
    setToken('')
    setUser(null)
    setSubscriptions([])
    setSubscriptionForm(emptySubscription)
    setEditingId('')
    setAuthMessage('')
    setDashboardMessage('')
    setDashboardError('')
  }

  const upcomingCount = subscriptions.filter((subscription) => subscription?.isActive).length

  return (
    <div className="app-shell">
      <div className="app-background" aria-hidden="true" />

      <main className="layout">
        <section className="hero-card">
          <div className="hero-copy">
            <span className="eyebrow">Subscription Studio</span>
            <h1>Track recurring revenue and renewals in one focused workspace.</h1>
            <p>
              Manage signups, log in, and keep every subscription visible with a simple SaaS-style dashboard built
              around the backend routes you already have.
            </p>

            <div className="hero-stats">
              <article>
                <strong>{subscriptions.length}</strong>
                <span>Total subscriptions</span>
              </article>
              <article>
                <strong>{activeCount}</strong>
                <span>Active plans</span>
              </article>
              <article>
                <strong>{formatCurrency(totalMonthlySpend)}</strong>
                <span>Active monthly spend</span>
              </article>
            </div>
          </div>

          <div className="hero-panel">
            <div className="panel-header">
              <div>
                <span className="panel-label">Status</span>
                <h2>{token ? 'Workspace connected' : 'Sign in to continue'}</h2>
              </div>
              <span className={`status-pill ${token ? 'success' : 'neutral'}`}>{token ? 'Online' : 'Locked'}</span>
            </div>

            {user ? (
              <div className="user-card">
                <div>
                  <span className="muted">Signed in as</span>
                  <strong>{user.name}</strong>
                  <p>{user.email}</p>
                </div>
                <button className="ghost-button" type="button" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            ) : (
              <div className="auth-toggle">
                <button
                  type="button"
                  className={authMode === 'login' ? 'toggle-button active' : 'toggle-button'}
                  onClick={() => setAuthMode('login')}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={authMode === 'signup' ? 'toggle-button active' : 'toggle-button'}
                  onClick={() => setAuthMode('signup')}
                >
                  Sign up
                </button>
              </div>
            )}

            {!token ? (
              <form className="auth-form" onSubmit={handleAuthSubmit}>
                {authMode === 'signup' && (
                  <label>
                    Name
                    <input
                      value={authForm.name}
                      onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                      type="text"
                      placeholder="Acme Ops"
                    />
                  </label>
                )}

                <label>
                  Email
                  <input
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                    type="email"
                    placeholder="you@company.com"
                  />
                </label>

                <label>
                  Password
                  <input
                    value={authForm.password}
                    onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                    type="password"
                    placeholder="••••••••"
                  />
                </label>

                {authError && <p className="feedback error">{authError}</p>}
                {authMessage && <p className="feedback success">{authMessage}</p>}

                <button className="primary-button" type="submit" disabled={loadingAuth}>
                  {loadingAuth ? 'Working...' : authMode === 'login' ? 'Log in' : 'Create account'}
                </button>
              </form>
            ) : (
              <div className="hero-note">
                <p>Use the form below to create, edit, and remove subscriptions.</p>
              </div>
            )}
          </div>
        </section>

        <section className="content-grid">
          <div className="card">
            <div className="card-header">
              <div>
                <span className="panel-label">Subscription form</span>
                <h2>{editingId ? 'Edit subscription' : 'Add subscription'}</h2>
              </div>
              {editingId && (
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => {
                    setEditingId('')
                    setSubscriptionForm(emptySubscription)
                  }}
                >
                  Cancel edit
                </button>
              )}
            </div>

            <form className="subscription-form" onSubmit={handleSubscriptionSubmit}>
              <label>
                Name
                <input
                  required
                  value={subscriptionForm.name}
                  onChange={(event) => setSubscriptionForm({ ...subscriptionForm, name: event.target.value })}
                  placeholder="Figma"
                />
              </label>

              <div className="two-column">
                <label>
                  Price
                  <input
                    required
                    value={subscriptionForm.price}
                    onChange={(event) => setSubscriptionForm({ ...subscriptionForm, price: event.target.value })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="12.00"
                  />
                </label>

                <label>
                  Billing cycle
                  <select
                    value={subscriptionForm.billingCycle}
                    onChange={(event) => setSubscriptionForm({ ...subscriptionForm, billingCycle: event.target.value })}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </label>
              </div>

              <label>
                Next billing date
                <input
                  required
                  value={subscriptionForm.nextBillingDate}
                  onChange={(event) => setSubscriptionForm({ ...subscriptionForm, nextBillingDate: event.target.value })}
                  type="date"
                />
              </label>

              <div className="two-column">
                <label>
                  Category
                  <input
                    required
                    value={subscriptionForm.category}
                    onChange={(event) => setSubscriptionForm({ ...subscriptionForm, category: event.target.value })}
                    placeholder="Productivity"
                  />
                </label>

                <label className="checkbox-field">
                  <span>Active</span>
                  <input
                    checked={subscriptionForm.isActive}
                    onChange={(event) => setSubscriptionForm({ ...subscriptionForm, isActive: event.target.checked })}
                    type="checkbox"
                  />
                </label>
              </div>

              {dashboardError && <p className="feedback error">{dashboardError}</p>}
              {dashboardMessage && <p className="feedback success">{dashboardMessage}</p>}

              <button className="primary-button" type="submit" disabled={!token}>
                {editingId ? 'Update subscription' : 'Save subscription'}
              </button>
            </form>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <span className="panel-label">Portfolio</span>
                <h2>Current subscriptions</h2>
              </div>
              <span className="mini-metric">{upcomingCount} active</span>
            </div>

            {loadingSubscriptions ? (
              <div className="empty-state">Loading subscriptions...</div>
            ) : subscriptions.length === 0 ? (
              <div className="empty-state">
                <h3>No subscriptions yet</h3>
                <p>Add your first subscription to start tracking recurring costs.</p>
              </div>
            ) : (
              <div className="subscription-list">
                {subscriptions.map((subscription) => (
                  <article className="subscription-row" key={subscription._id}>
                    <div className="subscription-main">
                      <div>
                        <h3>{subscription.name}</h3>
                        <p>
                          {subscription.category} • {subscription.billingCycle}
                        </p>
                      </div>
                      <strong>{formatCurrency(subscription.price)}</strong>
                    </div>

                    <div className="subscription-meta">
                      <span>{formatDate(subscription.nextBillingDate)}</span>
                      <span className={subscription.isActive ? 'badge success' : 'badge muted'}>
                        {subscription.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <div className="subscription-actions">
                      <button type="button" className="ghost-button" onClick={() => handleEditSubscription(subscription)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        onClick={() => handleDeleteSubscription(subscription._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
