import { Link } from 'react-router-dom'

export default function BrandHeader({ action }) {
  return (
    <header className="brand-header">
      <Link className="brand-mark" to="/dashboard">
        Subscriptions
      </Link>
      <div className="brand-actions">{action}</div>
    </header>
  )
}
