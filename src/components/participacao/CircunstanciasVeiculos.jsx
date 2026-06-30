import { CIRCUNSTANCIAS_OPCOES } from '../../utils/participacaoMotorSchema'

export default function CircunstanciasVeiculos({ circunstanciasA = {}, circunstanciasB = {}, onChangeA, onChangeB }) {
  const toggle = (target, id, isA) => {
    const current = isA ? circunstanciasA : circunstanciasB
    const next = { ...current, [id]: !current[id] }
    if (isA) onChangeA(next)
    else onChangeB(next)
  }

  return (
    <div className="circunstancias-veiculos">
      <div className="circunstancias-table">
        <div className="circunstancias-table__head">
          <div className="circunstancias-table__circ">Circunstância</div>
          <div className="circunstancias-table__veh">Veículo A</div>
          <div className="circunstancias-table__veh">Veículo B</div>
        </div>
        {CIRCUNSTANCIAS_OPCOES.map((opt) => (
          <div key={opt.id} className="circunstancias-table__row">
            <div className="circunstancias-table__circ">{opt.label}</div>
            <div className="circunstancias-table__veh">
              <button
                type="button"
                className={`circunstancias-check ${circunstanciasA[opt.id] ? 'active' : ''}`}
                aria-pressed={Boolean(circunstanciasA[opt.id])}
                onClick={() => toggle('A', opt.id, true)}
              >
                {circunstanciasA[opt.id] ? 'X' : ''}
              </button>
            </div>
            <div className="circunstancias-table__veh">
              <button
                type="button"
                className={`circunstancias-check ${circunstanciasB[opt.id] ? 'active' : ''}`}
                aria-pressed={Boolean(circunstanciasB[opt.id])}
                onClick={() => toggle('B', opt.id, false)}
              >
                {circunstanciasB[opt.id] ? 'X' : ''}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
