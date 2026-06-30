import { IMPACT_VIEWS, IMPACT_ZONES } from '../../utils/participacaoMotorSchema'

function CarSilhouette({ view }) {
  if (view === 'esquerda' || view === 'direita') {
    const flip = view === 'direita'
    return (
      <svg viewBox="0 0 100 80" className="pontos-embate-car-svg" aria-hidden="true">
        <g transform={flip ? 'scale(-1,1) translate(-100,0)' : undefined}>
          <rect x="8" y="48" width="84" height="18" rx="6" fill="none" stroke="#333" strokeWidth="1.2" />
          <path d="M12 48 Q18 38 28 36 L42 34 L58 34 L72 36 Q82 38 88 48" fill="none" stroke="#333" strokeWidth="1.2" />
          <circle cx="26" cy="66" r="7" fill="none" stroke="#333" strokeWidth="1.2" />
          <circle cx="74" cy="66" r="7" fill="none" stroke="#333" strokeWidth="1.2" />
          <line x1="50" y1="36" x2="50" y2="66" stroke="#ccc" strokeWidth="0.6" strokeDasharray="2 2" />
          <line x1="62" y1="36" x2="62" y2="66" stroke="#ccc" strokeWidth="0.6" strokeDasharray="2 2" />
        </g>
      </svg>
    )
  }

  if (view === 'frente') {
    return (
      <svg viewBox="0 0 100 80" className="pontos-embate-car-svg" aria-hidden="true">
        <rect x="22" y="28" width="56" height="40" rx="8" fill="none" stroke="#333" strokeWidth="1.2" />
        <rect x="30" y="36" width="40" height="14" rx="3" fill="none" stroke="#333" strokeWidth="1" />
        <circle cx="20" cy="62" r="7" fill="none" stroke="#333" strokeWidth="1.2" />
        <circle cx="80" cy="62" r="7" fill="none" stroke="#333" strokeWidth="1.2" />
        <circle cx="30" cy="54" r="4" fill="none" stroke="#333" strokeWidth="1" />
        <circle cx="70" cy="54" r="4" fill="none" stroke="#333" strokeWidth="1" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 100 80" className="pontos-embate-car-svg" aria-hidden="true">
      <rect x="22" y="28" width="56" height="40" rx="8" fill="none" stroke="#333" strokeWidth="1.2" />
      <rect x="30" y="40" width="40" height="12" rx="3" fill="none" stroke="#333" strokeWidth="1" />
      <circle cx="20" cy="62" r="7" fill="none" stroke="#333" strokeWidth="1.2" />
      <circle cx="80" cy="62" r="7" fill="none" stroke="#333" strokeWidth="1.2" />
      <circle cx="30" cy="54" r="4" fill="none" stroke="#333" strokeWidth="1" />
      <circle cx="70" cy="54" r="4" fill="none" stroke="#333" strokeWidth="1" />
    </svg>
  )
}

const VIEW_LABELS = {
  esquerda: 'Lado esquerdo',
  direita: 'Lado direito',
  frente: 'Frente',
  traseira: 'Traseira',
}

export default function PontosEmbateVeiculo({ label, value = {}, onChange }) {
  const toggle = (key) => {
    onChange({ ...value, [key]: !value[key] })
  }

  return (
    <div className="pontos-embate-panel">
      <div className="pontos-embate-panel__header">10. Pontos de embate — {label}</div>
      <div className="pontos-embate-grid">
        {IMPACT_VIEWS.map((view) => (
          <div key={view} className="pontos-embate-view">
            <small className="pontos-embate-view__label">{VIEW_LABELS[view]}</small>
            <div className="pontos-embate-view__canvas">
              <CarSilhouette view={view} />
              {IMPACT_ZONES[view].map((zone) => {
                const key = `${view}_${zone.id}`
                const active = Boolean(value[key])
                return (
                  <button
                    key={key}
                    type="button"
                    className={`pontos-embate-check ${active ? 'active' : ''}`}
                    style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
                    title={zone.label}
                    aria-label={`${zone.label} — ${active ? 'marcado' : 'não marcado'}`}
                    aria-pressed={active}
                    onClick={() => toggle(key)}
                  >
                    {active ? 'X' : ''}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
