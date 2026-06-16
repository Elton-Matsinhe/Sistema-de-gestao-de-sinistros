import {
  FaClock,
  FaHashtag,
  FaMoneyBillWave,
  FaPlus,
  FaSave,
  FaTools,
  FaTrash,
  FaWrench,
} from 'react-icons/fa'
import { onlyDecimal, onlyDigits } from '../../utils/peritagemInputHelpers'
import { calcMateriaisTotals, emptyMaoObraRow, emptyPecaRow } from '../../utils/peritagemDefaults'

export default function PeritagemMateriaisSection({ data, onChange, onSave, saving, readOnly = false, hideHeader = false }) {
  const totals = calcMateriaisTotals(data)

  const updatePeca = (id, key, value) => {
    if (readOnly) return
    onChange({
      ...data,
      pecas: data.pecas.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    })
  }

  const updateMaoObra = (id, key, value) => {
    if (readOnly) return
    onChange({
      ...data,
      maoObra: data.maoObra.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    })
  }

  return (
    <div className="peritagem-form-wrap peritagem-form-wrap--full">
      {!hideHeader && (
        <div className="peritagem-form-header">
          <h2>Materiais e Mão de Obra</h2>
          <p>Valores sem IVA. Adicione linhas conforme a cotação da oficina.</p>
        </div>
      )}

      <section className="peritagem-section">
        <h3><FaWrench /> Peças a Substituir</h3>
        <div className="materiais-table-wrap">
          <table className="materiais-table materiais-table--premium">
            <thead>
              <tr>
                <th><FaWrench /> Peças a Substituir</th>
                <th><FaHashtag /> Quantidade</th>
                <th><FaMoneyBillWave /> Custo Unitário (s/ IVA)</th>
                <th><FaMoneyBillWave /> Valor Total [MTS]</th>
                {!readOnly && <th />}
              </tr>
            </thead>
            <tbody>
              {data.pecas.map((row, index) => {
                const computed = totals.pecas[index]
                return (
                  <tr key={row.id}>
                    <td><input value={row.descricao} onChange={(e) => updatePeca(row.id, 'descricao', e.target.value)} disabled={readOnly} /></td>
                    <td><input inputMode="numeric" value={row.quantidade} onChange={(e) => updatePeca(row.id, 'quantidade', onlyDigits(e.target.value))} disabled={readOnly} /></td>
                    <td><input inputMode="decimal" value={row.custoUnitario} onChange={(e) => updatePeca(row.id, 'custoUnitario', onlyDecimal(e.target.value))} disabled={readOnly} /></td>
                    <td className="td-computed">{computed?.valorTotal || '0.00'}</td>
                    {!readOnly && (
                      <td>
                        <button type="button" className="btn-icon-danger" onClick={() => onChange({ ...data, pecas: data.pecas.filter((p) => p.id !== row.id) })}>
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!readOnly && (
            <button type="button" className="btn-table" onClick={() => onChange({ ...data, pecas: [...data.pecas, emptyPecaRow()] })}>
              <FaPlus /> Adicionar peça
            </button>
          )}
        </div>
        <div className="materiais-summary">
          <div><span>Subtotal das Peças</span><strong>{totals.subTotalPecas} MTS</strong></div>
          <div><span>Desconto</span><input inputMode="decimal" value={data.descontoPecas} onChange={(e) => onChange({ ...data, descontoPecas: onlyDecimal(e.target.value) })} disabled={readOnly} /></div>
          <div><span>Total das Peças</span><strong>{totals.totalPecas} MTS</strong></div>
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaTools /> Mão de Obra</h3>
        <div className="materiais-table-wrap">
          <table className="materiais-table materiais-table--premium">
            <thead>
              <tr>
                <th><FaTools /> Mão de Obra</th>
                <th><FaClock /> N.º Horas</th>
                <th><FaMoneyBillWave /> Valor Hora (s/ IVA)</th>
                <th><FaMoneyBillWave /> Valor (Meticais)</th>
                {!readOnly && <th />}
              </tr>
            </thead>
            <tbody>
              {data.maoObra.map((row) => (
                  <tr key={row.id}>
                    <td><input value={row.descricao} onChange={(e) => updateMaoObra(row.id, 'descricao', e.target.value)} disabled={readOnly} placeholder="Ex: Bate-chapas" /></td>
                    <td><input inputMode="numeric" value={row.horas} onChange={(e) => updateMaoObra(row.id, 'horas', onlyDigits(e.target.value))} disabled={readOnly} /></td>
                    <td><input inputMode="decimal" value={row.valorHora} onChange={(e) => updateMaoObra(row.id, 'valorHora', onlyDecimal(e.target.value))} disabled={readOnly} /></td>
                    <td>
                      <input
                        inputMode="decimal"
                        value={row.valor}
                        onChange={(e) => updateMaoObra(row.id, 'valor', onlyDecimal(e.target.value))}
                        disabled={readOnly}
                        placeholder="0.00"
                      />
                    </td>
                    {!readOnly && (
                      <td>
                        <button type="button" className="btn-icon-danger" onClick={() => onChange({ ...data, maoObra: data.maoObra.filter((m) => m.id !== row.id) })}>
                          <FaTrash />
                        </button>
                      </td>
                    )}
                  </tr>
              ))}
            </tbody>
          </table>
          {!readOnly && (
            <button type="button" className="btn-table" onClick={() => onChange({ ...data, maoObra: [...data.maoObra, emptyMaoObraRow()] })}>
              <FaPlus /> Adicionar mão de obra
            </button>
          )}
        </div>
        <div className="materiais-summary">
          <div><span>Subtotal de Mão de Obra</span><strong>{totals.subTotalMaoObra} MTS</strong></div>
          <div><span>Desconto</span><input inputMode="decimal" value={data.descontoMaoObra} onChange={(e) => onChange({ ...data, descontoMaoObra: onlyDecimal(e.target.value) })} disabled={readOnly} /></div>
          <div><span>Total de Mão de Obra</span><strong>{totals.totalMaoObra} MTS</strong></div>
        </div>
      </section>

      <div className="materiais-grand-total">
        <span>Total de Peças e Mão de Obra</span>
        <strong>{totals.totalGeral} MTS</strong>
      </div>

      {!readOnly && (
        <button type="button" className="primary-btn form-btn peritagem-save-btn" onClick={() => onSave({ ...data, ...totals })} disabled={saving}>
          <FaSave />
          {saving ? 'A guardar...' : 'Guardar materiais e mão de obra'}
        </button>
      )}
    </div>
  )
}
