import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm.jsx'
import BrandHeader from '../components/BrandHeader.jsx'
import { apiRequest } from '../lib/api.js'
import { saveSession } from '../lib/session.js'

const emptyForm = {
  name: '',
  email: '',
  password: '',
}

export default function SignUpPage() {
  const navigate = useNavigate()
  const [values, setValues] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(values),
      })

      if (data.token && data.user) {
        saveSession({ token: data.token, user: data.user })
        navigate('/dashboard', { replace: true })
        return
      }

      setMessage(data.message || 'Account created. Please sign in.')
      setValues(emptyForm)
      navigate('/signin', { replace: true, state: { message: 'Account created. Sign in to continue.' } })
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
        <BrandHeader action={<Link className="ghost-link" to="/signin">Sign in</Link>} />
        <AuthForm
          mode="signup"
          title="Create your account"
          subtitle="Set up access for your team and start tracking subscriptions in a simple workspace."
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
