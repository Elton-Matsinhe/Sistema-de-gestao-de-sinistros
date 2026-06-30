function resolveSpan(field, span, isTextarea) {
  if (span === 'full' || span === 2) return span
  if (isTextarea) return 'full'
  const len = (field.label || '').length
  if (len >= 48 || (field.type === 'select' && len >= 28)) return 'full'
  if (len >= 30 || field.type === 'select') return 2
  return 1
}

export default function ParticipacaoField({ field, value, onChange, readOnly, span = 1 }) {
  const Icon = field.icon
  const isTextarea = field.type === 'textarea'
  const isSelect = field.type === 'select'
  const inputType = field.type === 'number' || field.numeric ? 'text' : field.type
  const resolvedSpan = resolveSpan(field, span, isTextarea)
  const spanClass =
    resolvedSpan === 'full'
      ? 'participacao-field--full'
      : resolvedSpan === 2
        ? 'participacao-field--span-2'
        : ''

  const handleChange = (event) => {
    let next = event.target.value
    if (field.numeric || field.type === 'number') {
      next = next.replace(/[^\d]/g, '')
    }
    onChange(next)
  }

  const placeholder =
    field.placeholder !== undefined
      ? field.placeholder
      : isSelect
        ? 'Seleccionar uma opção'
        : field.label

  const commonProps = {
    id: field.id,
    value: value ?? '',
    onChange: handleChange,
    placeholder,
    required: field.required,
    readOnly: readOnly,
    disabled: readOnly,
    'aria-label': field.label,
    title: field.label,
  }

  return (
    <div
      className={`participacao-field-box ${spanClass} ${isSelect ? 'participacao-field--select' : ''} ${isTextarea ? 'participacao-field--textarea' : ''} ${readOnly ? 'is-readonly' : ''}`}
    >
      <label className="participacao-field-label" htmlFor={field.id}>
        {field.label}
        {field.required ? <span className="participacao-required">*</span> : null}
      </label>
      <div className="participacao-field-control">
        {Icon && <Icon className="participacao-field-icon" aria-hidden="true" />}
        {isSelect ? (
          <select {...commonProps}>
            <option value="">{placeholder}</option>
            {(field.options || []).map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea {...commonProps} rows={3} />
        ) : (
          <input type={inputType} {...commonProps} inputMode={field.numeric ? 'numeric' : undefined} />
        )}
      </div>
    </div>
  )
}
