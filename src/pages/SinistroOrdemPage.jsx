import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaFileAlt,
  FaFileUpload,
  FaHashtag,
  FaPaperPlane,
  FaPen,
  FaPrint,
  FaTimesCircle,
  FaTrash,
  FaUserTie,
  FaWrench,
} from 'react-icons/fa'
import mammoth from 'mammoth'
import OrdemQuatacaoFormBuilder from '../components/ordem/OrdemQuatacaoFormBuilder'
import AutoDateTimeNotice from '../components/AutoDateTimeNotice'
import SinistroProcessosDataTable from '../components/sinistro/SinistroProcessosDataTable'
import { getLocalDateTimeNow } from '../utils/datetime'
import {
  ORDEM_DOC_TYPES,
  createEmptyOrdemReparacaoData,
  createEmptyQuitacaoData,
} from '../utils/ordemQuatacaoConfig'
import {
  downloadOrdemQuatacaoPdf,
  ordemQuatacaoPdfToDataUrl,
  printOrdemQuatacaoPdf,
} from '../utils/ordemQuatacaoPdf'
import {
  clearOrdemDocumento,
  getSinistroDocumentProcesses,
  saveOrdemFormularioDraft,
  sendDocumentoToGestor,
  sendToContabilidade,
} from '../utils/processes'
import { getSession } from '../utils/auth'

const PAGE_SIZE = 5

export default function SinistroOrdemPage() {
  const [searchParams] = useSearchParams()
  const [version, setVersion] = useState(0)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [modo, setModo] = useState('criar')
  const [docType, setDocType] = useState('ordem_reparacao')
  const [formData, setFormData] = useState(createEmptyOrdemReparacaoData())
  const [ordemFile, setOrdemFile] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [formPreviewUrl, setFormPreviewUrl] = useState('')
  const [docxPreviewHtml, setDocxPreviewHtml] = useState('')
  const [docxPreviewMessage, setDocxPreviewMessage] = useState('')
  const session = getSession()

  const processos = useMemo(() => getSinistroDocumentProcesses(), [version])
  const filtrados = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processos.filter((p) => {
      if (!q) return true
      return `${p.numeroSinistro} ${p.cliente} ${p.matricula}`.toLowerCase().includes(q)
    })
  }, [processos, query])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtrados.slice(start, start + PAGE_SIZE)
  }, [filtrados, currentPage])

  const selectedProcess = useMemo(
    () => processos.find((item) => item.id === selectedId) || null,
    [processos, selectedId],
  )

  const signedFile = selectedProcess?.gestorAssinadoDocumento || null
  const sourceFile = selectedProcess?.ordemReparacaoDocumento || null
  const signedDataUrl = signedFile?.dataUrl || sourceFile?.dataUrl || ''
  const signedName = signedFile?.nome || sourceFile?.nome || ''

  useEffect(() => {
    if (!selectedProcess) return
    const tipo = selectedProcess.ordemFormularioTipo || 'ordem_reparacao'
    const base = tipo === 'quitacao'
      ? createEmptyQuitacaoData(selectedProcess)
      : createEmptyOrdemReparacaoData(selectedProcess)
    setDocType(tipo)
    setFormData({ ...base, ...(selectedProcess.ordemFormularioData || {}) })
    if (selectedProcess.ordemFormularioOrigem === 'upload') setModo('upload')
    else if (selectedProcess.ordemFormularioData || selectedProcess.ordemReparacaoDocumento) setModo('criar')
  }, [selectedProcess?.id, version])

  const handleTypeChange = (tipo) => {
    setDocType(tipo)
    if (!selectedProcess) return
    setFormData(
      tipo === 'quitacao'
        ? createEmptyQuitacaoData(selectedProcess)
        : createEmptyOrdemReparacaoData(selectedProcess),
    )
  }

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
      reader.readAsDataURL(file)
    })

  const handleGuardarRascunho = () => {
    if (!selectedProcess) return
    saveOrdemFormularioDraft(selectedProcess.id, {
      ordemFormularioTipo: docType,
      ordemFormularioData: formData,
    })
    setVersion((v) => v + 1)
    setMensagem('Rascunho do formulário guardado no processo.')
  }

  const handlePreviewFormPdf = async () => {
    try {
      const url = await ordemQuatacaoPdfToDataUrl(docType, formData)
      if (formPreviewUrl) URL.revokeObjectURL(formPreviewUrl)
      setFormPreviewUrl(url)
      setPreviewOpen(true)
      setMensagem('')
    } catch {
      setMensagem('Preencha pelo menos um campo para visualizar o PDF.')
    }
  }

  const handleDownloadFormPdf = async () => {
    try {
      await downloadOrdemQuatacaoPdf(docType, formData, selectedProcess?.numeroSinistro)
      setMensagem('PDF transferido com sucesso.')
    } catch {
      setMensagem('Não foi possível gerar o PDF.')
    }
  }

  const handlePrintFormPdf = async () => {
    try {
      await printOrdemQuatacaoPdf(docType, formData)
    } catch {
      setMensagem('Não foi possível imprimir o PDF.')
    }
  }

  const handleEnviarGestorFormulario = async () => {
    if (!selectedProcess) return
    try {
      const dataUrl = await ordemQuatacaoPdfToDataUrl(docType, formData)
      const meta = ORDEM_DOC_TYPES[docType]
      const nome = `${meta.filePrefix}-${selectedProcess.numeroSinistro}.pdf`
      const updated = sendDocumentoToGestor(selectedProcess.id, {
        ordemReparacaoDocumento: {
          nome,
          tipo: 'application/pdf',
          dataUrl,
        },
        ordemReparacaoDataUpload: getLocalDateTimeNow(),
        enviadoGestorData: getLocalDateTimeNow(),
        ordemFormularioTipo: docType,
        ordemFormularioData: formData,
        ordemFormularioOrigem: 'sistema',
      })
      if (!updated) {
        setMensagem('Falha ao enviar o documento para o gestor.')
        return
      }
      setVersion((v) => v + 1)
      setMensagem(`Formulário PDF enviado ao gestor: ${updated.numeroSinistro}.`)
    } catch {
      setMensagem('Preencha os campos e tente novamente.')
    }
  }

  const handleEnviarGestorUpload = async () => {
    if (!selectedProcess || !ordemFile) {
      setMensagem('Carregue o documento da Ordem/Quitação.')
      return
    }
    let dataUrl = ''
    try {
      dataUrl = await readFileAsDataUrl(ordemFile)
    } catch {
      setMensagem('Não foi possível ler o documento.')
      return
    }
    const updated = sendDocumentoToGestor(selectedProcess.id, {
      ordemReparacaoDocumento: {
        nome: ordemFile.name,
        tipo: ordemFile.type,
        tamanho: ordemFile.size,
        dataUrl,
      },
      ordemReparacaoDataUpload: getLocalDateTimeNow(),
      enviadoGestorData: getLocalDateTimeNow(),
      ordemFormularioOrigem: 'upload',
    })
    if (!updated) {
      setMensagem('Falha ao enviar o documento para o gestor.')
      return
    }
    setOrdemFile(null)
    setVersion((v) => v + 1)
    setMensagem(`Documento enviado ao gestor: ${updated.numeroSinistro}.`)
  }

  const handleEliminarDocumento = () => {
    if (!selectedProcess) return
    if (
      !window.confirm(
        `Tem a certeza de que deseja eliminar o documento Ordem/Quitação do processo ${selectedProcess.numeroSinistro}? Esta acção não pode ser revertida.`,
      )
    ) {
      return
    }
    clearOrdemDocumento(selectedProcess.id)
    setOrdemFile(null)
    setFormData(
      docType === 'quitacao'
        ? createEmptyQuitacaoData(selectedProcess)
        : createEmptyOrdemReparacaoData(selectedProcess),
    )
    setPreviewOpen(false)
    setVersion((v) => v + 1)
    setMensagem('Documento eliminado do processo.')
  }

  const handleEnviarContabilidade = () => {
    if (!selectedProcess?.gestorAssinadoDocumento) {
      setMensagem('Este processo ainda não foi assinado pelo gestor.')
      return
    }
    const confirmadoEm = getLocalDateTimeNow()
    const updated = sendToContabilidade(selectedProcess.id, {
      aprovacaoGestorNome: session?.name || 'Gestor Técnico',
      aprovacaoGestorData: confirmadoEm,
      enviadoContabilidadeData: confirmadoEm,
    })
    if (!updated) {
      setMensagem('Não foi possível enviar para a Contabilidade.')
      return
    }
    setVersion((v) => v + 1)
    setMensagem(`Processo ${updated.numeroSinistro} enviado para Contabilidade.`)
  }

  const etapaDocumento = (item) => {
    if (item.comprovativoPagamentoDocumento) return { label: 'Pagamento comprovado', className: 'finalizado' }
    if (item.enviadoContabilidade) return { label: 'Enviado para Contabilidade', className: 'emandamento' }
    if (item.gestorAssinadoDocumento) return { label: 'Assinado pelo gestor', className: 'finalizado' }
    if (item.enviadoGestor) return { label: 'Aguardando assinatura do gestor', className: 'emandamento' }
    if (item.ordemReparacaoDocumento) return { label: 'Documento anexado', className: 'iniciado' }
    if (item.ordemFormularioData) return { label: 'Rascunho no sistema', className: 'iniciado' }
    return { label: 'Aguardando ordem', className: 'iniciado' }
  }

  const podeEliminar = Boolean(
    selectedProcess?.ordemReparacaoDocumento || selectedProcess?.ordemFormularioData,
  ) && !selectedProcess?.gestorAssinadoDocumento

  useEffect(() => {
    const processId = searchParams.get('id')
    if (!processId) return
    const exists = processos.some((item) => item.id === processId)
    if (exists) setSelectedId(processId)
  }, [processos, searchParams])

  useEffect(() => {
    let active = true
    const loadDocxPreview = async () => {
      setDocxPreviewHtml('')
      setDocxPreviewMessage('')
      if (!signedDataUrl || !signedName?.toLowerCase().endsWith('.docx')) return
      try {
        const base64 = String(signedDataUrl).split(',')[1] || ''
        const raw = atob(base64)
        const buffer = new ArrayBuffer(raw.length)
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        if (!active) return
        setDocxPreviewHtml(result.value || '<p>Documento sem conteúdo.</p>')
      } catch {
        if (!active) return
        setDocxPreviewMessage('Não foi possível gerar a pré-visualização deste DOCX.')
      }
    }
    if (previewOpen && !formPreviewUrl) loadDocxPreview()
    return () => { active = false }
  }, [previewOpen, signedDataUrl, signedName, formPreviewUrl])

  const gestorSlotMode = useMemo(() => {
    if (selectedProcess?.gestorAssinadoDocumento) return 'signed'
    if (selectedProcess?.enviadoGestor) return 'sent'
    return 'reserved'
  }, [selectedProcess])

  return (
    <div className="form-page users-page ordem-page">
      <div className="sinistro-page-hero">
        <div className="sinistro-page-hero__icon"><FaWrench /></div>
        <div>
          <h1 className="dash-title sinistro-page-hero__title">Ordem de Reparação e Quitação</h1>
          <p className="form-subtitle">
            Crie o formulário no sistema ou carregue um documento Word/PDF, anexe ao processo e envie ao Gestor para assinatura.
          </p>
        </div>
      </div>

      <SinistroProcessosDataTable
        title="Processos disponíveis"
        titleIcon={<FaFileAlt />}
        searchPlaceholder="Pesquisar por nº sinistro, cliente ou matrícula"
        searchValue={query}
        onSearchChange={(val) => { setQuery(val); setPage(1) }}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true, minWidth: '130px' },
          { key: 'cliente', label: 'Cliente', icon: <FaUserTie />, minWidth: '180px' },
          {
            key: 'etapa',
            label: 'Etapa',
            icon: <FaCheckCircle />,
            minWidth: '150px',
            render: (item) => {
              const etapa = etapaDocumento(item)
              return <span className={`pill ${etapa.className}`}>{etapa.label}</span>
            },
          },
          {
            key: 'documento',
            label: 'Documento',
            icon: <FaFileAlt />,
            minWidth: '200px',
            render: (item) => (
              <span className="sinistro-premium-cell">
                {item.ordemReparacaoDocumento?.nome || (item.ordemFormularioData ? 'Rascunho sistema' : '—')}
              </span>
            ),
          },
        ]}
        rows={paged}
        selectedId={selectedId}
        renderActions={(item) => (
          <button type="button" className="sinistro-action-btn sinistro-action-btn--select" onClick={() => setSelectedId(item.id)}>
            Selecionar
          </button>
        )}
        emptyMessage="Nenhum processo encontrado."
        pagination={{
          currentPage,
          totalPages,
          totalCount: filtrados.length,
          onPageChange: setPage,
        }}
      />

      {selectedProcess && (
        <section className="ordem-workspace ordem-workspace--full">
          {selectedProcess.gestorAssinadoDocumento && (
            <div className="ordem-gestor-assinado-alert">
              <div>
                <strong>Documento assinado pelo gestor</strong>
                <p>
                  {selectedProcess.gestorAssinadoPor || 'Gestor'} em{' '}
                  {selectedProcess.gestorAssinadoData || '—'} — pode visualizar ou transferir o PDF assinado.
                </p>
              </div>
              <div className="ordem-gestor-assinado-alert__actions">
                <button
                  type="button"
                  className="sinistro-action-btn sinistro-action-btn--view"
                  onClick={() => {
                    setFormPreviewUrl('')
                    setPreviewOpen(true)
                  }}
                >
                  <FaEye /> Visualizar
                </button>
                {selectedProcess.gestorAssinadoDocumento?.dataUrl && (
                  <a
                    className="sinistro-action-btn sinistro-action-btn--download"
                    href={selectedProcess.gestorAssinadoDocumento.dataUrl}
                    download={selectedProcess.gestorAssinadoDocumento.nome || 'documento-assinado.pdf'}
                  >
                    <FaDownload /> Baixar
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="ordem-workspace__head">
            <h3>{selectedProcess.numeroSinistro} — {selectedProcess.cliente}</h3>
            <div className="ordem-mode-tabs">
              <button type="button" className={`ordem-mode-tab ${modo === 'criar' ? 'active' : ''}`} onClick={() => setModo('criar')}>
                <FaPen /> Criar no sistema
              </button>
              <button type="button" className={`ordem-mode-tab ${modo === 'upload' ? 'active' : ''}`} onClick={() => setModo('upload')}>
                <FaFileUpload /> Carregar ficheiro
              </button>
            </div>
          </div>

          {modo === 'criar' ? (
            <>
              <div className="ordem-type-picker">
                <span className="ordem-type-picker__label">Tipo de formulário:</span>
                {Object.values(ORDEM_DOC_TYPES).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`ordem-type-btn ${docType === t.id ? 'active' : ''}`}
                    style={{ '--ordem-color': t.color }}
                    onClick={() => handleTypeChange(t.id)}
                  >
                    <FaFileAlt /> {t.shortLabel}
                  </button>
                ))}
              </div>

              <OrdemQuatacaoFormBuilder
                typeId={docType}
                data={formData}
                onChange={setFormData}
                gestorNomeDefault={session?.name || ''}
                gestorSlotMode={gestorSlotMode}
              />

              <div className="ordem-form-actions">
                <button type="button" className="btn-table" onClick={handleGuardarRascunho}>
                  Guardar rascunho no processo
                </button>
                <button type="button" className="btn-table" onClick={handlePreviewFormPdf}>
                  <FaEye /> Visualizar PDF
                </button>
                <button type="button" className="btn-table" onClick={handlePrintFormPdf}>
                  <FaPrint /> Imprimir
                </button>
                <button type="button" className="btn-table" onClick={handleDownloadFormPdf}>
                  <FaDownload /> Baixar PDF
                </button>
                <button type="button" className="primary-btn" onClick={handleEnviarGestorFormulario}>
                  <FaPaperPlane /> Enviar ao Gestor
                </button>
                {podeEliminar && (
                  <button type="button" className="btn-table ordem-btn-delete" onClick={handleEliminarDocumento}>
                    <FaTrash /> Eliminar documento
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="form-subtitle">Documento Word ou PDF da Ordem/Quitação</p>
              <div className="ordem-upload-zone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const f = e.dataTransfer.files?.[0]
                  if (f) setOrdemFile(f)
                }}
              >
                <FaFileUpload />
                <input type="file" accept=".doc,.docx,.pdf" onChange={(e) => setOrdemFile(e.target.files?.[0] || null)} />
                <small>Arraste e largue ou seleccione o ficheiro</small>
              </div>
              <AutoDateTimeNotice label="Data da edição da ordem" />
              <div className="ordem-form-actions">
                <button type="button" className="primary-btn" onClick={handleEnviarGestorUpload}>
                  <FaPaperPlane /> Enviar ao Gestor
                </button>
                {selectedProcess.ordemReparacaoDocumento && (
                  <button type="button" className="btn-table" onClick={() => { setFormPreviewUrl(''); setPreviewOpen(true) }}>
                    <FaEye /> Visualizar documento
                  </button>
                )}
                {podeEliminar && (
                  <button type="button" className="btn-table ordem-btn-delete" onClick={handleEliminarDocumento}>
                    <FaTrash /> Eliminar documento
                  </button>
                )}
              </div>
            </>
          )}

          <div className="ordem-contabilidade-block">
            <AutoDateTimeNotice label="Data de aprovação para envio à Contabilidade" />
            <button
              type="button"
              className="btn-table"
              onClick={handleEnviarContabilidade}
              disabled={!selectedProcess.gestorAssinadoDocumento || selectedProcess.enviadoContabilidade}
            >
              <FaCheckCircle /> Enviar para Contabilidade
            </button>
          </div>

          {mensagem && <p className="form-success">{mensagem}</p>}
        </section>
      )}

      {previewOpen && (
        <section className="ordem-preview-panel ordem-preview-panel--full">
          <div className="ordem-preview-panel__head">
            <h3>Pré-visualização do documento</h3>
            <button type="button" className="btn-table" onClick={() => { setPreviewOpen(false); setFormPreviewUrl('') }}>
              <FaTimesCircle /> Fechar
            </button>
          </div>
          {formPreviewUrl && (
            <iframe title="Preview PDF" src={formPreviewUrl} className="ordem-preview-iframe" />
          )}
          {!formPreviewUrl && selectedProcess?.gestorAssinadoDocumento?.dataUrl && (
            <iframe
              title="Preview assinado pelo gestor"
              src={selectedProcess.gestorAssinadoDocumento.dataUrl}
              className="ordem-preview-iframe"
            />
          )}
          {!formPreviewUrl && !selectedProcess?.gestorAssinadoDocumento?.dataUrl && signedDataUrl && signedName?.toLowerCase().endsWith('.pdf') && (
            <iframe title="Preview assinado" src={signedDataUrl} className="ordem-preview-iframe" />
          )}
          {!formPreviewUrl && signedDataUrl && signedName?.toLowerCase().endsWith('.docx') && (
            <div className="ordem-docx-preview" dangerouslySetInnerHTML={{ __html: docxPreviewHtml || docxPreviewMessage }} />
          )}
        </section>
      )}
    </div>
  )
}
