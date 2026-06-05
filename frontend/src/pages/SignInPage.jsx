import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm.jsx'
import BrandHeader from '../components/BrandHeader.jsx'
import { apiRequest } from '../lib/api.js'
import { saveSession } from '../lib/session.js'

const emptyForm = {
  email: '',
  password: '',
}

export default function SignInPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [values, setValues] = useState(emptyForm)
  const [message] = useState(location.state?.message ?? '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      })

      saveSession({ token: data.token, user: data.user })
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell">
      <div className="app-background" aria-hidden="true" />
      <div className="layout">
        <BrandHeader action={<Link className="ghost-link" to="/signup">Create account</Link>} />
        <AuthForm
          mode="signin"
          title="Welcome back"
          subtitle="Sign in to manage your subscriptions and keep the dashboard in sync with the backend."
          values={values}
          onChange={(field, value) => setValues((current) => ({ ...current, [field]: value }))}
          onSubmit={handleSubmit}
          error={error}
          message={message}
          loading={loading}
        />
      </div>
    </div>
  )
}
