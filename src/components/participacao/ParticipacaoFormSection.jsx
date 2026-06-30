import { useState } from 'react'
import ParticipacaoAccordionSection from './ParticipacaoAccordionSection'
import ParticipacaoField from './ParticipacaoField'

function groupSchema(schema) {
  const groups = []
  let current = { section: null, icon: null, fields: [] }

  schema.forEach((item) => {
    if (item.section) {
      if (current.section || current.fields.length) groups.push(current)
      current = { section: item.section, icon: item.icon, fields: [] }
      return
    }
    current.fields.push(item)
  })

  if (current.section || current.fields.length) groups.push(current)
  return groups
}

export default function ParticipacaoFormSection({ schema, data, onChange, readOnly = false }) {
  const groups = groupSchema(schema)
  const [openMap, setOpenMap] = useState(() =>
    Object.fromEntries(groups.map((_, i) => [`s${i}`, i === 0])),
  )

  const toggle = (key) => setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <div className="participacao-motor-form participacao-motor-form--accordion">
      <p className="participacao-accordion-hint">Clique em cada secção para abrir ou fechar.</p>
      {groups.map((group, index) => {
        const key = `s${index}`
        const Icon = group.icon
        return (
          <ParticipacaoAccordionSection
            key={key}
            id={key}
            title={group.section || 'Dados do formulário'}
            icon={Icon}
            open={Boolean(openMap[key])}
            onToggle={() => toggle(key)}
          >
            <div className="participacao-form-section">
              {group.fields.map((field) => (
                <ParticipacaoField
                  key={field.id}
                  field={field}
                  value={data[field.id] ?? ''}
                  onChange={(value) => onChange(field.id, value)}
                  readOnly={readOnly || field.readOnly}
                  span={field.type === 'textarea' ? 'full' : 1}
                />
              ))}
            </div>
          </ParticipacaoAccordionSection>
        )
      })}
    </div>
  )
}
