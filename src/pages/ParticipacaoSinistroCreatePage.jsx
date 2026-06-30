import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaFileAlt,
  FaHashtag,
  FaPlus,
  FaPrint,
  FaSave,
  FaTimes,
  FaArrowLeft,
} from 'react-icons/fa'
import ClienteAssinaturaPanel from '../components/participacao/ClienteAssinaturaPanel'
import ParticipacaoFormSection from '../components/participacao/ParticipacaoFormSection'
import ParticipacaoMotorClaimForm from '../components/participacao/ParticipacaoMotorClaimForm'
import {
  FORM_TYPES,
  getFieldsForType,
  getSupplementaryFormTypes,
  mergeParticipacaoMotorData,
} from '../utils/participacaoFormConfig'
import {
  downloadParticipacaoPdf,
  downloadSingleFormPdf,
  printParticipacaoPdf,
  printSingleFormPdf,
  previewSingleFormPdf,
} from '../utils/participacaoPdf'
import {
  addFormToParticipacao,
  createParticipacaoDraft,
  finalizeParticipacao,
  getParticipacaoById,
  removeFormFromParticipacao,
  saveParticipacao,
  setParticipacaoNumeroSinistro,
  updateParticipacaoAssinatura,
  updateParticipacaoFormData,
} from '../utils/participacoes'

export default function ParticipacaoSinistroCreatePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('id')

  const [participacao, setParticipacao] = useState(() => createParticipacaoDraft())
  const [activeFormId, setActiveFormId] = useState(() => participacao.forms[0]?.id)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [previewUrl, setPreviewUrl] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!editId) return
    const existing = getParticipacaoById(editId)
    if (existing) {
      const forms = existing.forms.map((f) => {
        if (f.typeId !== 'participacao') return f
        return {
          ...f,
          data: mergeParticipacaoMotorData(f.data, f.data?.numeroApolice),
        }
      })
      setParticipacao({ ...existing, forms })
      setActiveFormId(forms[0]?.id)
    }
  }, [editId])

  const activeForm = useMemo(
    () => participacao.forms.find((f) => f.id === activeFormId) || participacao.forms[0],
    [participacao, activeFormId],
  )

  const activeType = activeForm ? FORM_TYPES[activeForm.typeId] : null
  const schema = activeForm ? getFieldsForType(activeForm.typeId) : []
  const supplementary = getSupplementaryFormTypes()
  const usedTypeIds = participacao.forms.map((f) => f.typeId)

  const handleFieldChange = useCallback(
    (fieldId, value) => {
      if (!activeForm) return
      let next = updateParticipacaoFormData(participacao, activeForm.id, fieldId, value)
      if (fieldId === 'numeroSinistro') {
        next = setParticipacaoNumeroSinistro(next, value)
      }
      setParticipacao(next)
    },
    [participacao, activeForm],
  )

  const handleAssinatura = useCallback(
    (assinatura) => {
      if (!activeForm) return
      setParticipacao(updateParticipacaoAssinatura(participacao, activeForm.id, assinatura))
    },
    [participacao, activeForm],
  )

  const handleAddForm = (typeId) => {
    const next = addFormToParticipacao(participacao, typeId)
    setParticipacao(next)
    const newForm = next.forms.find((f) => f.typeId === typeId && !participacao.forms.some((pf) => pf.id === f.id))
    if (newForm) setActiveFormId(newForm.id)
    setShowAddMenu(false)
    setMessage(`Formulário "${FORM_TYPES[typeId].label}" adicionado à participação.`)
  }

  const handleRemoveForm = (formId) => {
    const form = participacao.forms.find((f) => f.id === formId)
    if (!form || FORM_TYPES[form.typeId]?.isPrimary) return
    if (!window.confirm(`Remover o formulário "${FORM_TYPES[form.typeId].label}" desta participação?`)) return
    const next = removeFormFromParticipacao(participacao, formId)
    setParticipacao(next)
    if (activeFormId === formId) setActiveFormId(next.forms[0]?.id)
  }

  const handleSaveDraft = () => {
    setIsSaving(true)
    const saved = saveParticipacao({ ...participacao, status: participacao.status === 'submetida' ? 'submetida' : 'rascunho' })
    setParticipacao(saved)
    setMessage('Participação guardada como rascunho.')
    setError('')
    setIsSaving(false)
  }

  const handleFinalize = () => {
    const primary = participacao.forms[0]
    const d = primary?.data || {}
    const isMotor = primary?.typeId === 'participacao'
    const hasCliente = isMotor
      ? Boolean(d.seguradoA?.nomes || d.seguradoA?.apelidos || d.condutorA?.nomes)
      : Boolean(d.nomeSegurado || d.nomeTrabalhador)
    if (!hasCliente) {
      setError('Preencha pelo menos o nome do segurado no formulário principal.')
      return
    }
    if (isMotor && !d.dataAcidente) {
      setError('Indique a data do acidente no formulário principal.')
      return
    }
    setIsSaving(true)
    try {
      const saved = finalizeParticipacao(participacao)
      setParticipacao(saved)
      setMessage(
        `Participação submetida com sucesso! Processo criado automaticamente — Nº Sinistro: ${saved.numeroSinistro}`,
      )
      setError('')
    } catch (err) {
      setError(err?.message || 'Erro ao submeter participação.')
    }
    setIsSaving(false)
  }

  const handleFormPdf = async (formId, action) => {
    try {
      const draft = saveParticipacao(participacao)
      setParticipacao(draft)
      if (action === 'download') {
        await downloadSingleFormPdf(draft, formId)
        setMessage('PDF do formulário transferido.')
      } else if (action === 'print') {
        await printSingleFormPdf(draft, formId)
        setMessage('PDF aberto para impressão.')
      } else if (action === 'preview') {
        const url = await previewSingleFormPdf(draft, formId)
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        setPreviewUrl(url)
        setShowPreview(true)
      }
      setError('')
    } catch (err) {
      setError(err?.message || 'Não foi possível gerar o PDF deste formulário.')
    }
  }

  const handlePreviewPdf = async (action) => {
    try {
      const draft = saveParticipacao(participacao)
      if (action === 'print') await printParticipacaoPdf(draft)
      else await downloadParticipacaoPdf(draft)
    } catch {
      setError('Não foi possível gerar o PDF. Verifique os formulários preenchidos.')
    }
  }

  return (
    <div className="form-page participacao-page">
      <div className="participacao-page-header">
        <div>
          <h1 className="dash-title">Participação de Sinistro</h1>
          <p className="form-subtitle">
            Preencha o formulário principal e adicione formulários complementares conforme o tipo de sinistro.
          </p>
        </div>
        <div className="participacao-header-actions">
          <button type="button" className="btn-table" onClick={() => handlePreviewPdf('download')}>
            <FaDownload /> Baixar PDF
          </button>
          <button type="button" className="btn-table" onClick={() => handlePreviewPdf('print')}>
            <FaPrint /> Imprimir
          </button>
        </div>
      </div>

      <div className="participacao-numero-bar">
        <label className="field-group participacao-numero-field">
          <FaHashtag className="field-icon" />
          <input
            type="text"
            placeholder="Nº do sinistro (editável)"
            value={participacao.numeroSinistro || participacao.forms[0]?.data?.numeroSinistro || ''}
            onChange={(e) => {
              const next = setParticipacaoNumeroSinistro(participacao, e.target.value)
              setParticipacao(next)
            }}
          />
          <small>Nº do sinistro — pode ser informado antes ou após o preenchimento</small>
        </label>
        {participacao.processoId && (
          <span className="participacao-processo-badge">
            <FaCheckCircle /> Processo vinculado
          </span>
        )}
      </div>

      <div className="participacao-forms-tabs">
        {participacao.forms.map((form) => {
          const type = FORM_TYPES[form.typeId]
          const Icon = type?.icon || FaFileAlt
          return (
            <div key={form.id} className="participacao-form-tab-wrap">
              <button
                type="button"
                className={`participacao-form-tab ${activeFormId === form.id ? 'active' : ''}`}
                style={{ '--tab-color': type?.color }}
                onClick={() => setActiveFormId(form.id)}
              >
                <Icon />
                <span>{type?.shortLabel || form.typeId}</span>
                {form.assinaturaCliente && <FaCheckCircle className="participacao-tab-signed" />}
              </button>
              {!type?.isPrimary && (
                <button
                  type="button"
                  className="participacao-tab-remove"
                  title="Remover formulário"
                  onClick={() => handleRemoveForm(form.id)}
                >
                  <FaTimes />
                </button>
              )}
            </div>
          )
        })}

        <div className="participacao-add-form">
          <button
            type="button"
            className="participacao-add-btn"
            onClick={() => setShowAddMenu((v) => !v)}
          >
            <FaPlus /> Adicionar formulário
          </button>
          {showAddMenu && (
            <div className="participacao-add-menu">
              {supplementary
                .filter((t) => !usedTypeIds.includes(t.id))
                .map((t) => {
                  const Icon = t.icon
                  return (
                    <button key={t.id} type="button" onClick={() => handleAddForm(t.id)}>
                      <Icon style={{ color: t.color }} />
                      <div>
                        <strong>{t.label}</strong>
                        <small>{t.description}</small>
                      </div>
                    </button>
                  )
                })}
              {supplementary.every((t) => usedTypeIds.includes(t.id)) && (
                <p className="participacao-add-empty">Todos os formulários complementares já foram adicionados.</p>
              )}
            </div>
          )}
        </div>
      </div>

      {activeForm && activeType && (
        <div className="participacao-form-layout participacao-form-layout--full">
          <div className="participacao-form-card form-card participacao-form-card--full">
            <div className="participacao-form-card__head" style={{ borderColor: activeType.color }}>
              <activeType.icon style={{ color: activeType.color }} />
              <div>
                <h3>{activeType.label}</h3>
                <p>{activeType.description}</p>
              </div>
              <div className="participacao-form-pdf-actions">
                <button type="button" className="btn-table" title="Visualizar PDF deste formulário" onClick={() => handleFormPdf(activeForm.id, 'preview')}>
                  <FaEye /> Visualizar
                </button>
                <button type="button" className="btn-table" title="Baixar PDF deste formulário" onClick={() => handleFormPdf(activeForm.id, 'download')}>
                  <FaDownload /> Baixar
                </button>
                <button type="button" className="btn-table" title="Imprimir PDF deste formulário" onClick={() => handleFormPdf(activeForm.id, 'print')}>
                  <FaPrint /> Imprimir
                </button>
              </div>
            </div>

            {activeForm.typeId === 'participacao' ? (
              <ParticipacaoMotorClaimForm
                data={activeForm.data}
                onChange={handleFieldChange}
              />
            ) : (
              <ParticipacaoFormSection
                schema={schema}
                data={activeForm.data}
                onChange={handleFieldChange}
              />
            )}

            <div className="participacao-assinatura-segurado">
              <h4>10. Assinatura do segurado</h4>
              <ClienteAssinaturaPanel
                value={activeForm.assinaturaCliente}
                onChange={handleAssinatura}
                nomeCliente={
                  activeForm.typeId === 'participacao'
                    ? [activeForm.data?.seguradoA?.apelidos, activeForm.data?.seguradoA?.nomes].filter(Boolean).join(' ')
                    : activeForm.data?.nomeSegurado || activeForm.data?.nomeTrabalhador || ''
                }
              />
            </div>
          </div>
        </div>
      )}

      <div className="participacao-footer-actions">
        <button type="button" className="btn-table" onClick={() => navigate('/Sinistro/Participacao/Listar')}>
          <FaArrowLeft /> Voltar à lista
        </button>
        <button type="button" className="btn-table" disabled={isSaving} onClick={handleSaveDraft}>
          <FaSave /> Guardar rascunho
        </button>
        <button type="button" className="primary-btn" disabled={isSaving} onClick={handleFinalize}>
          <FaCheckCircle /> Submeter e criar processo
        </button>
      </div>

      {message && <p className="form-success">{message}</p>}
      {error && <p className="login-error">{error}</p>}

      {showPreview && previewUrl && (
        <section className="form-card form-card--wide participacao-pdf-preview">
          <div className="participacao-pdf-preview__head">
            <h3>Pré-visualização do formulário</h3>
            <button type="button" className="btn-table" onClick={() => { setShowPreview(false); setPreviewUrl('') }}>
              <FaTimes /> Fechar
            </button>
          </div>
          <iframe title="Preview formulário" src={previewUrl} className="participacao-pdf-preview__frame" />
        </section>
      )}
    </div>
  )
}
