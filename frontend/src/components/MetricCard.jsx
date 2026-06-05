export default function MetricCard({ label, value, helper }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      {helper ? <p>{helper}</p> : null}
    </article>
  )
}
