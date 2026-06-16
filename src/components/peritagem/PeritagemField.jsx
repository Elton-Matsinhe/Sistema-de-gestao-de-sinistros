export default function PeritagemField({ label, icon, children, full, error }) {
  return (
    <label className={`peritagem-field ${full ? 'field-full' : ''} ${error ? 'peritagem-field--error' : ''}`}>
      <span className="peritagem-field__label">
        {icon && <span className="peritagem-field__icon" aria-hidden="true">{icon}</span>}
        {label}
      </span>
      <div className="peritagem-input-wrap">
        {icon && <span className="peritagem-input-wrap__icon" aria-hidden="true">{icon}</span>}
        <div className="peritagem-input-wrap__control">{children}</div>
      </div>
      {error && <small className="peritagem-field__error">{error}</small>}
    </label>
  )
}
