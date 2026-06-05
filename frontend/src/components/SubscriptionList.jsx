export default function SubscriptionList({ items, onEdit, onDelete, loading }) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Portfolio</span>
          <h2>Current subscriptions</h2>
        </div>
        <span className="mini-metric">{items.filter((item) => item.isActive).length} active</span>
      </div>

      {loading ? (
        <div className="empty-state">Loading subscriptions...</div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <h3>No subscriptions yet</h3>
          <p>Add your first subscription to start tracking recurring costs.</p>
        </div>
      ) : (
        <div className="subscription-list">
          {items.map((item) => (
            <article className="subscription-row" key={item._id}>
              <div className="subscription-main">
                <div>
                  <h3>{item.name}</h3>
                  <p>
                    {item.category} • {item.billingCycle}
                  </p>
                </div>
                <strong>{Number(item.price || 0).toFixed(2)}</strong>
              </div>

              <div className="subscription-meta">
                <span>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(item.nextBillingDate))}</span>
                <span className={item.isActive ? 'badge success' : 'badge muted'}>{item.isActive ? 'Active' : 'Paused'}</span>
              </div>

              <div className="subscription-actions">
                <button type="button" className="ghost-button" onClick={() => onEdit(item)}>
                  Edit
                </button>
                <button type="button" className="danger-button" onClick={() => onDelete(item._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
