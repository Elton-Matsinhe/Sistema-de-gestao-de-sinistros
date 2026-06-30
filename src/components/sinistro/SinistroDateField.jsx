import { FaCalendarAlt } from 'react-icons/fa'

export default function SinistroDateField({
  label,
  hint,
  value,
  onChange,
  required = false,
  icon: Icon = FaCalendarAlt,
}) {
  return (
    <label className="field-group sinistro-date-field">
      <span className="sinistro-date-field__label">{label}</span>
      <div className="sinistro-date-input-wrap">
        <Icon className="field-icon" aria-hidden="true" />
        <input
          type="date"
          value={value}
          onChange={onChange}
          required={required}
          aria-label={label}
        />
        <span className="sinistro-date-format-badge">dd/mm/aaaa</span>
      </div>
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  )
}
