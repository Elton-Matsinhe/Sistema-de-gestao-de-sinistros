import { useMemo, useState } from 'react'
import {
  FaCalendarAlt,
  FaCar,
  FaCarCrash,
  FaClipboardList,
  FaEnvelope,
  FaFileAlt,
  FaGasPump,
  FaHashtag,
  FaIdCard,
  FaIndustry,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPalette,
  FaPhone,
  FaPhoneAlt,
  FaRegUser,
  FaSave,
  FaTachometerAlt,
  FaTools,
  FaUserTie,
  FaUsers,
} from 'react-icons/fa'
import { ZONAS_ACIDENTADAS } from '../../utils/peritagemDefaults'
import {
  buildYearOptions,
  calcTotalLiquidar,
  CATEGORIAS_CARTA,
  COMBUSTIVEIS,
  isValidEmail,
  onlyDecimal,
  onlyDigits,
} from '../../utils/peritagemInputHelpers'
import PeritagemField from './PeritagemField'

export default function PeritagemFormularioSection({
  form,
  onChange,
  onSave,
  saving,
  readOnly = false,
  hideHeader = false,
}) {
  const [emailError, setEmailError] = useState('')
  const yearOptions = useMemo(() => buildYearOptions(), [])

  const set = (key, value) => {
    if (readOnly) return
    onChange({ ...form, [key]: value })
  }

  const setDigits = (key, value) => set(key, onlyDigits(value))
  const setDecimal = (key, value) => set(key, onlyDecimal(value))

  const setResumoValor = (key, value) => {
    if (readOnly) return
    const sanitized = onlyDecimal(value)
    const next = { ...form, [key]: sanitized }
    if (key === 'resumoCotacaoInicial' || key === 'resumoFranquia') {
      const cotacao = key === 'resumoCotacaoInicial' ? sanitized : form.resumoCotacaoInicial
      const franquia = key === 'resumoFranquia' ? sanitized : form.resumoFranquia
      next.resumoTotalLiquidar = calcTotalLiquidar(cotacao, franquia)
    }
    onChange(next)
  }

  const toggleZona = (id) => {
    if (readOnly) return
    const current = form.zonasAcidentadas || []
    const next = current.includes(id) ? current.filter((z) => z !== id) : [...current, id]
    set('zonasAcidentadas', next)
  }

  const handleSave = () => {
    if (!isValidEmail(form.oficinaEmail)) {
      setEmailError('Introduza um e-mail válido.')
      return
    }
    setEmailError('')
    onSave()
  }

  return (
    <div className="peritagem-form-wrap peritagem-form-wrap--full">
      {!hideHeader && (
        <div className="peritagem-form-header">
          <h2>Formulário de Peritagem</h2>
          <p>Preencha todos os campos conforme a inspecção realizada no veículo.</p>
        </div>
      )}

      <section className="peritagem-section">
        <h3><FaClipboardList /> Dados Processo</h3>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Data Sinistro" icon={<FaCalendarAlt />}><input type="date" value={form.dataSinistro} onChange={(e) => set('dataSinistro', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º de Processo" icon={<FaHashtag />}><input value={form.numeroProcesso} onChange={(e) => set('numeroProcesso', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º de Apólice" icon={<FaFileAlt />}><input value={form.numeroApolice} onChange={(e) => set('numeroApolice', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Tipo Sinistro" icon={<FaCarCrash />}><input value={form.tipoSinistro} onChange={(e) => set('tipoSinistro', e.target.value)} placeholder="Ex: Choque" disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Peritagem" icon={<FaCalendarAlt />}><input type="date" value={form.dataPeritagem} onChange={(e) => set('dataPeritagem', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Capital Seguro (MT)" icon={<FaMoneyBillWave />}><input inputMode="decimal" value={form.capitalSeguro} onChange={(e) => setDecimal('capitalSeguro', e.target.value)} disabled={readOnly} /></PeritagemField>
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaRegUser /> Dados Segurado</h3>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Nome" icon={<FaRegUser />}><input value={form.seguradoNome} onChange={(e) => set('seguradoNome', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Contacto" icon={<FaPhone />}><input inputMode="numeric" value={form.seguradoContacto} onChange={(e) => setDigits('seguradoContacto', e.target.value)} disabled={readOnly} placeholder="Apenas números" /></PeritagemField>
          <PeritagemField label="Morada" icon={<FaMapMarkerAlt />}><input value={form.seguradoMorada} onChange={(e) => set('seguradoMorada', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Localidade" icon={<FaMapMarkerAlt />}><input value={form.seguradoLocalidade} onChange={(e) => set('seguradoLocalidade', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Observações" icon={<FaFileAlt />} full><textarea rows={2} value={form.seguradoObservacoes} onChange={(e) => set('seguradoObservacoes', e.target.value)} disabled={readOnly} /></PeritagemField>
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaCar /> Dados do Veículo a Reparar</h3>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Matrícula" icon={<FaCar />}><input value={form.veiculoMatricula} onChange={(e) => set('veiculoMatricula', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º Quadro" icon={<FaHashtag />}><input value={form.veiculoQuadro} onChange={(e) => set('veiculoQuadro', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Cilindrada" icon={<FaTachometerAlt />}><input inputMode="numeric" value={form.veiculoCilindrada} onChange={(e) => setDigits('veiculoCilindrada', e.target.value)} disabled={readOnly} placeholder="cc" /></PeritagemField>
          <PeritagemField label="Marca" icon={<FaCar />}><input value={form.veiculoMarca} onChange={(e) => set('veiculoMarca', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º Motor" icon={<FaTools />}><input value={form.veiculoMotor} onChange={(e) => set('veiculoMotor', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Kilómetros" icon={<FaTachometerAlt />}><input inputMode="numeric" value={form.veiculoKm} onChange={(e) => setDigits('veiculoKm', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Modelo" icon={<FaCar />}><input value={form.veiculoModelo} onChange={(e) => set('veiculoModelo', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º Cilindros" icon={<FaHashtag />}><input inputMode="numeric" value={form.veiculoCilindros} onChange={(e) => setDigits('veiculoCilindros', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Combustível" icon={<FaGasPump />}>
            <select value={form.veiculoCombustivel} onChange={(e) => set('veiculoCombustivel', e.target.value)} disabled={readOnly}>
              <option value="">Selecionar combustível</option>
              {COMBUSTIVEIS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </PeritagemField>
          <PeritagemField label="Lotação" icon={<FaUsers />}><input inputMode="numeric" value={form.veiculoLotacao} onChange={(e) => setDigits('veiculoLotacao', e.target.value)} disabled={readOnly} placeholder="Apenas números" /></PeritagemField>
          <PeritagemField label="Cor" icon={<FaPalette />}><input value={form.veiculoCor} onChange={(e) => set('veiculoCor', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Ano" icon={<FaCalendarAlt />}>
            <select value={form.veiculoAno} onChange={(e) => set('veiculoAno', e.target.value)} disabled={readOnly}>
              <option value="">Selecionar ano</option>
              {yearOptions.map((year) => <option key={year} value={String(year)}>{year}</option>)}
            </select>
          </PeritagemField>
          <PeritagemField label="Outros Dados" icon={<FaFileAlt />} full><input value={form.veiculoOutros} onChange={(e) => set('veiculoOutros', e.target.value)} disabled={readOnly} /></PeritagemField>
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaIdCard /> Dados Condutor do Veículo Seguro</h3>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Nome" icon={<FaRegUser />}><input value={form.condutorNome} onChange={(e) => set('condutorNome', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Contacto" icon={<FaPhone />}><input inputMode="numeric" value={form.condutorContacto} onChange={(e) => setDigits('condutorContacto', e.target.value)} disabled={readOnly} placeholder="Apenas números" /></PeritagemField>
          <PeritagemField label="Morada" icon={<FaMapMarkerAlt />}><input value={form.condutorMorada} onChange={(e) => set('condutorMorada', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Localidade" icon={<FaMapMarkerAlt />}><input value={form.condutorLocalidade} onChange={(e) => set('condutorLocalidade', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º Carta de Condução" icon={<FaIdCard />}><input value={form.condutorCarta} onChange={(e) => set('condutorCarta', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Categoria" icon={<FaIdCard />}>
            <select value={form.condutorCategoria} onChange={(e) => set('condutorCategoria', e.target.value)} disabled={readOnly}>
              <option value="">Selecionar categoria</option>
              {CATEGORIAS_CARTA.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </PeritagemField>
          <PeritagemField label="Data Carta" icon={<FaCalendarAlt />}><input type="date" value={form.condutorDataCarta} onChange={(e) => set('condutorDataCarta', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Relação" icon={<FaUserTie />}><input value={form.condutorRelacao} onChange={(e) => set('condutorRelacao', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Idade" icon={<FaHashtag />}><input inputMode="numeric" value={form.condutorIdade} onChange={(e) => setDigits('condutorIdade', e.target.value)} disabled={readOnly} placeholder="Apenas números" /></PeritagemField>
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaIndustry /> Dados Oficina</h3>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Ent. Reparadora" icon={<FaIndustry />}><input value={form.oficinaNome} onChange={(e) => set('oficinaNome', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Telefone" icon={<FaPhoneAlt />}><input inputMode="numeric" value={form.oficinaTelefone} onChange={(e) => setDigits('oficinaTelefone', e.target.value)} disabled={readOnly} placeholder="Apenas números" /></PeritagemField>
          <PeritagemField label="Morada" icon={<FaMapMarkerAlt />}><input value={form.oficinaMorada} onChange={(e) => set('oficinaMorada', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Fax" icon={<FaPhone />}><input value={form.oficinaFax} onChange={(e) => set('oficinaFax', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Localidade" icon={<FaMapMarkerAlt />}><input value={form.oficinaLocalidade} onChange={(e) => set('oficinaLocalidade', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Telemóvel" icon={<FaPhone />}><input inputMode="numeric" value={form.oficinaTelemovel} onChange={(e) => setDigits('oficinaTelemovel', e.target.value)} disabled={readOnly} placeholder="Apenas números" /></PeritagemField>
          <PeritagemField label="NUIT" icon={<FaHashtag />}><input inputMode="numeric" value={form.oficinaNuit} onChange={(e) => setDigits('oficinaNuit', e.target.value)} disabled={readOnly} placeholder="Apenas números" /></PeritagemField>
          <PeritagemField label="E-mail" icon={<FaEnvelope />} error={emailError}>
            <input type="email" value={form.oficinaEmail} onChange={(e) => { set('oficinaEmail', e.target.value); if (emailError) setEmailError('') }} onBlur={() => setEmailError(isValidEmail(form.oficinaEmail) ? '' : 'E-mail inválido.')} disabled={readOnly} placeholder="exemplo@empresa.co.mz" />
          </PeritagemField>
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaFileAlt /> Observações</h3>
        <PeritagemField label="Descrição" icon={<FaFileAlt />} full>
          <textarea rows={4} value={form.observacoes} onChange={(e) => set('observacoes', e.target.value)} disabled={readOnly} />
        </PeritagemField>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Data da Cotação" icon={<FaCalendarAlt />}><input type="date" value={form.dataCotacao} onChange={(e) => set('dataCotacao', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Início de Reparação" icon={<FaCalendarAlt />}><input type="date" value={form.inicioReparacao} onChange={(e) => set('inicioReparacao', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º de Dias Rep." icon={<FaHashtag />}><input inputMode="numeric" value={form.diasReparacao} onChange={(e) => setDigits('diasReparacao', e.target.value)} disabled={readOnly} /></PeritagemField>
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaCarCrash /> Zonas Acidentadas</h3>
        <div className="zonas-grid">
          {ZONAS_ACIDENTADAS.map((zona) => (
            <button key={zona.id} type="button" className={`zona-chip ${(form.zonasAcidentadas || []).includes(zona.id) ? 'active' : ''}`} onClick={() => toggleZona(zona.id)} disabled={readOnly}>
              {zona.label}
            </button>
          ))}
        </div>
      </section>

      <section className="peritagem-section">
        <h3><FaTools /> Danos Materiais</h3>
        <PeritagemField label="Descrição dos danos" icon={<FaFileAlt />} full>
          <textarea rows={3} value={form.danosMateriais} onChange={(e) => set('danosMateriais', e.target.value)} disabled={readOnly} />
        </PeritagemField>
      </section>

      <section className="peritagem-section peritagem-section--resumo">
        <h3><FaMoneyBillWave /> Valores Totais [MTS] — Resumo</h3>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Capital Seguro" icon={<FaMoneyBillWave />}><input inputMode="decimal" value={form.resumoCapitalSeguro} onChange={(e) => setDecimal('resumoCapitalSeguro', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="N.º Cotação" icon={<FaHashtag />}><input inputMode="numeric" value={form.resumoNumeroCotacao} onChange={(e) => setDigits('resumoNumeroCotacao', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Cotação Inicial" icon={<FaMoneyBillWave />}><input inputMode="decimal" value={form.resumoCotacaoInicial} onChange={(e) => setResumoValor('resumoCotacaoInicial', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Franquia 10% mín. 10.000" icon={<FaMoneyBillWave />}><input inputMode="decimal" value={form.resumoFranquia} onChange={(e) => setResumoValor('resumoFranquia', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Total a Liquidar" icon={<FaMoneyBillWave />}>
            <input
              inputMode="decimal"
              className="peritagem-input--auto"
              value={form.resumoTotalLiquidar || calcTotalLiquidar(form.resumoCotacaoInicial, form.resumoFranquia)}
              readOnly
              title="Calculado automaticamente: Cotação Inicial − Franquia"
            />
          </PeritagemField>
        </div>
      </section>

      <section className="peritagem-section peritagem-section--assinatura">
        <h3><FaUserTie /> O Perito Avaliador</h3>
        <div className="peritagem-grid peritagem-grid--wide">
          <PeritagemField label="Nome" icon={<FaUserTie />}><input value={form.peritoAvaliador} readOnly /></PeritagemField>
          <PeritagemField label="Local" icon={<FaMapMarkerAlt />}><input value={form.peritoLocal} onChange={(e) => set('peritoLocal', e.target.value)} disabled={readOnly} /></PeritagemField>
          <PeritagemField label="Data" icon={<FaCalendarAlt />}><input type="date" value={form.peritoDataAssinatura} onChange={(e) => set('peritoDataAssinatura', e.target.value)} disabled={readOnly} /></PeritagemField>
        </div>
      </section>

      {!readOnly && (
        <button type="button" className="primary-btn form-btn peritagem-save-btn" onClick={handleSave} disabled={saving}>
          <FaSave />
          {saving ? 'A guardar...' : 'Guardar formulário'}
        </button>
      )}
    </div>
  )
}
