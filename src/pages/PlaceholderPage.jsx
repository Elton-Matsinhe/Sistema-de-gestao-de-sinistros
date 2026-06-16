export default function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder">
      <h1 className="dash-title">{title}</h1>
      <p>{description}</p>
    </div>
  )
}

