import { Link } from 'react-router-dom'

export default function AuthForm({
  mode,
  title,
  subtitle,
  values,
  onChange,
  onSubmit,
  error,
  message,
  loading,
}) {
  const isSignup = mode === 'signup'

  return (
    <section className="auth-shell">
      <div className="auth-panel">
        <div className="page-copy">
          <span className="eyebrow">Subscription Studio</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <form className="form-card" onSubmit={onSubmit}>
          {isSignup ? (
            <label>
              Name
              <input
                value={values.name}
                onChange={(event) => onChange('name', event.target.value)}
                type="text"
                placeholder="Acme Ops"
                autoComplete="name"
              />
            </label>
          ) : null}

          <label>
            Email
            <input
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              value={values.password}
              onChange={(event) => onChange('password', event.target.value)}
              type="password"
              placeholder="••••••••"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </label>

          {error ? <p className="feedback error">{error}</p> : null}
          {message ? <p className="feedback success">{message}</p> : null}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Working...' : isSignup ? 'Create account' : 'Sign in'}
          </button>

          <p className="form-footnote">
            {isSignup ? 'Already have an account?' : 'Need an account?'}{' '}
            <Link to={isSignup ? '/signin' : '/signup'}>{isSignup ? 'Sign in' : 'Create one'}</Link>
          </p>
        </form>
      </div>
    </section>
  )
}
