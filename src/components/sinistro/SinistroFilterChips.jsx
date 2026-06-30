export default function SinistroFilterChips({ label, labelIcon, options, value, onChange }) {
  return (
    <div className="sinistro-filter-group">
      <span className="sinistro-filter-group__label">
        {labelIcon}
        {label}
      </span>
      <div className="sinistro-filter-chips">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={`sinistro-filter-chip ${value === opt.id ? 'active' : ''}`}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
