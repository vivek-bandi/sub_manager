import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardShell from '../components/DashboardShell.jsx'
import MetricCard from '../components/MetricCard.jsx'
import SubscriptionForm from '../components/SubscriptionForm.jsx'
import SubscriptionList from '../components/SubscriptionList.jsx'
import { apiRequest } from '../lib/api.js'
import { clearSession, getStoredToken, getStoredUser } from '../lib/session.js'

const emptySubscription = {
  name: '',
  price: '',
  billingCycle: 'monthly',
  nextBillingDate: '',
  category: '',
  isActive: true,
}

function formatCurrency(value) {
  const numberValue = Number(value)

  if (Number.isNaN(numberValue)) {
    return '—'
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(numberValue)
}

function getMonthlyEquivalent(subscription) {
  const price = Number(subscription?.price || 0)

  if (subscription?.billingCycle === 'yearly') {
    return price / 12
  }

  return price
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const messageTimerRef = useRef(null)
  const [user, setUser] = useState(getStoredUser)
  const [token, setToken] = useState(getStoredToken)
  const [subscriptions, setSubscriptions] = useState([])
  const [form, setForm] = useState(emptySubscription)
  const [editingId, setEditingId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const totalMonthlySpend = useMemo(() => {
    return subscriptions.reduce((total, subscription) => {
      if (!subscription?.isActive) {
        return total
      }

      return total + getMonthlyEquivalent(subscription)
    }, 0)
  }, [subscriptions])

  const activeCount = subscriptions.filter((subscription) => subscription?.isActive).length

  const loadSubscriptions = useCallback(async (currentToken = token) => {
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest('/api/subscriptions', { token: currentToken })
      setSubscriptions(Array.isArray(data) ? data : [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      navigate('/signin', { replace: true })
      return
    }

    queueMicrotask(() => {
      void loadSubscriptions(token)
    })
  }, [loadSubscriptions, navigate, token])

  useEffect(() => {
    return () => {
      if (messageTimerRef.current) {
        clearTimeout(messageTimerRef.current)
      }
    }
  }, [])

  function showTransientMessage(text) {
    setMessage(text)

    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current)
    }

    messageTimerRef.current = setTimeout(() => {
      setMessage('')
      messageTimerRef.current = null
    }, 2000)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    const payload = {
      ...form,
      price: Number(form.price),
      isActive: Boolean(form.isActive),
    }

    try {
      if (editingId) {
        await apiRequest(`/api/subscriptions/${editingId}`, {
          token,
          method: 'PUT',
          body: JSON.stringify(payload),
        })
        showTransientMessage('Subscription updated.')
      } else {
        await apiRequest('/api/subscriptions', {
          token,
          method: 'POST',
          body: JSON.stringify(payload),
        })
        showTransientMessage('Subscription added.')
      }

      setForm(emptySubscription)
      setEditingId('')
      await loadSubscriptions()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    setError('')
    setMessage('')

    try {
      await apiRequest(`/api/subscriptions/${id}`, {
        token,
        method: 'DELETE',
      })
      showTransientMessage('Subscription removed.')
      await loadSubscriptions()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function handleEdit(subscription) {
    setEditingId(subscription._id)
    setForm({
      name: subscription.name ?? '',
      price: subscription.price ?? '',
      billingCycle: subscription.billingCycle ?? 'monthly',
      nextBillingDate: subscription.nextBillingDate ? subscription.nextBillingDate.slice(0, 10) : '',
      category: subscription.category ?? '',
      isActive: Boolean(subscription.isActive),
    })
  }

  function handleLogout() {
    clearSession()
    setToken('')
    setUser(null)
    setSubscriptions([])
    setForm(emptySubscription)
    setEditingId('')
    navigate('/signin', { replace: true })
  }

  return (
    <DashboardShell user={user} onLogout={handleLogout}>
      <section id="overview" className="hero-strip card">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Recurring subscriptions, kept clear.</h1>
          <p>Lightweight overview for tracking plans without a heavy interface.</p>
        </div>

        <div className="metrics-grid">
          <MetricCard label="Total subscriptions" value={subscriptions.length} helper="All saved records" />
          <MetricCard label="Active subscriptions" value={activeCount} helper="Currently on" />
          <MetricCard label="Monthly spend" value={formatCurrency(totalMonthlySpend)} helper="Active plans only" />
        </div>
      </section>

      <div id="subscriptions" className="dashboard-grid">
        <SubscriptionForm
          values={form}
          onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditingId('')
            setForm(emptySubscription)
          }}
          editing={Boolean(editingId)}
          disabled={saving}
          error={error}
          message={message}
        />

        <SubscriptionList items={subscriptions} onEdit={handleEdit} onDelete={handleDelete} loading={loading} />
      </div>

      <section id="insights" className="insights-strip">
        <div className="insights-card">
          <span className="eyebrow">Insight</span>
          <h2>One focus, one surface.</h2>
          <p>Keep the main actions visible and push everything secondary into lighter supporting blocks.</p>
        </div>
        <div className="insights-card subtle">
          <span className="eyebrow">Current status</span>
          <h2>{editingId ? 'Editing subscription' : 'Ready for updates'}</h2>
          <p>{editingId ? 'Finish the edit or cancel to return to the list.' : 'Add a plan when you need it.'}</p>
        </div>
      </section>
    </DashboardShell>
  )
}
