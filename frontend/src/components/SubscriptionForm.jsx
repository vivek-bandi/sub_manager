export default function SubscriptionForm({
  values,
  onChange,
  onSubmit,
  onCancel,
  editing,
  disabled,
  error,
  message,
}) {
  return (
    <section className="card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">Subscription form</span>
          <h2>{editing ? 'Edit subscription' : 'Add subscription'}</h2>
        </div>
        {editing ? (
          <button type="button" className="ghost-button" onClick={onCancel}>
            Cancel edit
          </button>
        ) : null}
      </div>

      <form className="stacked-form" onSubmit={onSubmit}>
        <label>
          Name
          <input
            required
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Figma"
          />
        </label>

        <div className="split-grid">
          <label>
            Price
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={values.price}
              onChange={(event) => onChange('price', event.target.value)}
              placeholder="12.00"
            />
          </label>

          <label>
            Billing cycle
            <select value={values.billingCycle} onChange={(event) => onChange('billingCycle', event.target.value)}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>
        </div>

        <label>
          Next billing date
          <input
            required
            type="date"
            value={values.nextBillingDate}
            onChange={(event) => onChange('nextBillingDate', event.target.value)}
          />
        </label>

        <div className="split-grid">
          <label>
            Category
            <input
              required
              value={values.category}
              onChange={(event) => onChange('category', event.target.value)}
              placeholder="Productivity"
            />
          </label>

          <label className="checkbox-field">
            <span>Active</span>
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => onChange('isActive', event.target.checked)}
            />
          </label>
        </div>

        {error ? <p className="feedback error">{error}</p> : null}
        {message ? <p className="feedback success">{message}</p> : null}

        <button className="primary-button" type="submit" disabled={disabled}>
          {editing ? 'Update subscription' : 'Save subscription'}
        </button>
      </form>
    </section>
  )
}
