import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FaCheckCircle,
  FaDownload,
  FaFileAlt,
  FaFileSignature,
  FaHashtag,
  FaIdCard,
  FaPenFancy,
  FaStamp,
  FaUpload,
  FaUserTie,
} from 'react-icons/fa'
import mammoth from 'mammoth'
import OrdemQuatacaoFormBuilder from '../components/ordem/OrdemQuatacaoFormBuilder'
import { getSession } from '../utils/auth'
import { getLocalDateTimeNow } from '../utils/datetime'
import { createStampedPdfDataUrl } from '../utils/pdfStamp'
import { ORDEM_DOC_TYPES } from '../utils/ordemQuatacaoConfig'
import { ordemQuatacaoPdfToDataUrl } from '../utils/ordemQuatacaoPdf'
import {
  assinarComoGestor,
  getGestorPendingProcesses,
} from '../utils/processes'

const FONT_OPTIONS = [
  { id: 'f1', label: 'Great Vibes', family: '"Great Vibes", "Segoe Script", cursive' },
  { id: 'f2', label: 'Pacifico', family: '"Pacifico", "Brush Script MT", cursive' },
  { id: 'f3', label: 'Dancing Script', family: '"Dancing Script", "Segoe Script", cursive' },
  { id: 'f4', label: 'Alex Brush', family: '"Alex Brush", "Segoe Script", cursive' },
  { id: 'f5', label: 'Allura', family: '"Allura", "Brush Script MT", cursive' },
  { id: 'f6', label: 'Sacramento', family: '"Sacramento", "Segoe Script", cursive' },
  { id: 'f7', label: 'Kaushan Script', family: '"Kaushan Script", "Segoe Script", cursive' },
  { id: 'f8', label: 'Satisfy', family: '"Satisfy", "Brush Script MT", cursive' },
  { id: 'f9', label: 'Marck Script', family: '"Marck Script", "Segoe Script", cursive' },
  { id: 'f10', label: 'Caveat', family: '"Caveat", "Segoe Script", cursive' },
  { id: 'f11', label: 'Poppins', family: '"Poppins", "Segoe UI", sans-serif' },
  { id: 'f12', label: 'Montserrat', family: '"Montserrat", "Segoe UI", sans-serif' },
  { id: 'f13', label: 'Roboto', family: '"Roboto", "Segoe UI", sans-serif' },
  { id: 'f14', label: 'Inter', family: '"Inter", "Segoe UI", sans-serif' },
  { id: 'f15', label: 'Lato', family: '"Lato", "Segoe UI", sans-serif' },
  { id: 'f16', label: 'Playfair Display', family: '"Playfair Display", Georgia, serif' },
  { id: 'f17', label: 'Merriweather', family: '"Merriweather", Georgia, serif' },
  { id: 'f18', label: 'Libre Baskerville', family: '"Libre Baskerville", Georgia, serif' },
  { id: 'f19', label: 'Source Code Pro', family: '"Source Code Pro", Consolas, monospace' },
  { id: 'f20', label: 'Oswald', family: '"Oswald", "Arial Narrow", sans-serif' },
]

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'))
    reader.readAsDataURL(file)
  })

export default function GestorAssinaturasPage() {
  const [version, setVersion] = useState(0)
  const [selectedId, setSelectedId] = useState('')
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [iniciais, setIniciais] = useState('')
  const [modo, setModo] = useState('assinatura')
  const [fontIdx, setFontIdx] = useState(0)
  const [opacity, setOpacity] = useState(0.75)
  const [seloFile, setSeloFile] = useState(null)
  const [seloDataUrl, setSeloDataUrl] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [docHtml, setDocHtml] = useState('')
  const [signaturePos, setSignaturePos] = useState({ x: 64, y: 64 })
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [desenhoAtivo, setDesenhoAtivo] = useState(false)
  const containerRef = useRef(null)
  const assinaturaRef = useRef(null)
  const drawCanvasRef = useRef(null)
  const [formData, setFormData] = useState(null)
  const session = getSession()

  const pendentes = useMemo(() => getGestorPendingProcesses(), [version])
  const selected = useMemo(
    () => pendentes.find((item) => item.id === selectedId) || null,
    [pendentes, selectedId],
  )

  const isSistemaForm = Boolean(
    selected?.ordemFormularioOrigem === 'sistema' && selected?.ordemFormularioData,
  )

  useEffect(() => {
    if (!selected || !isSistemaForm) {
      setFormData(null)
      return
    }
    setFormData({ ...selected.ordemFormularioData })
  }, [selected, isSistemaForm])

  useEffect(() => {
    if (!selected) {
      setDocHtml('')
      return
    }
    const file = selected.ordemReparacaoDocumento
    if (!file?.nome?.toLowerCase().endsWith('.docx')) {
      setDocHtml('')
      return
    }
    const load = async () => {
      try {
        const base64 = String(file.dataUrl || '').split(',')[1] || ''
        const raw = atob(base64)
        const buffer = new ArrayBuffer(raw.length)
        const bytes = new Uint8Array(buffer)
        for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i)
        const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
        setDocHtml(result.value || '')
      } catch {
        setDocHtml('<p>Falha ao preparar visualização do documento.</p>')
      }
    }
    load()
  }, [selected])

  useEffect(() => {
    const parts = nomeCompleto
      .trim()
      .split(/\s+/)
      .filter(Boolean)
    const generated = parts
      .slice(0, 3)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('')
    setIniciais(generated)
  }, [nomeCompleto])

  useEffect(() => {
    if (!dragging) return undefined
    const handleMouseMove = (event) => {
      if (!containerRef.current || !assinaturaRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const signRect = assinaturaRef.current.getBoundingClientRect()
      const x = Math.max(
        8,
        Math.min(event.clientX - rect.left - dragOffset.x, rect.width - signRect.width - 8),
      )
      const y = Math.max(
        8,
        Math.min(event.clientY - rect.top - dragOffset.y, rect.height - signRect.height - 8),
      )
      setSignaturePos({ x, y })
    }
    const handleMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragOffset.x, dragOffset.y, dragging])

  const assinaturaTexto =
    modo === 'iniciais'
      ? (iniciais || 'AZ').toUpperCase()
      : modo === 'selo'
        ? ''
        : modo === 'desenhar'
          ? ''
          : nomeCompleto || session?.name || 'Assinatura'

  const startDrag = (event) => {
    event.preventDefault()
    if (!containerRef.current || !assinaturaRef.current) return
    const signRect = assinaturaRef.current.getBoundingClientRect()
    setDragOffset({
      x: event.clientX - signRect.left,
      y: event.clientY - signRect.top,
    })
    setDragging(true)
  }

  const handleCanvasDown = (event) => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.strokeStyle = '#1b1b1b'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(event.clientX - rect.left, event.clientY - rect.top)
    setDesenhoAtivo(true)
  }

  const handleCanvasMove = (event) => {
    if (!desenhoAtivo) return
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.lineTo(event.clientX - rect.left, event.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => setDesenhoAtivo(false)

  const clearCanvas = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const getSignatureAsset = () => {
    if (modo === 'selo') return seloDataUrl
    if (modo === 'desenhar') return drawCanvasRef.current?.toDataURL('image/png') || ''
    const font = FONT_OPTIONS[fontIdx]?.family || 'cursive'
    const text = assinaturaTexto || 'Assinatura'
    const canvas = document.createElement('canvas')
    canvas.width = 520
    canvas.height = 140
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#5f6368'
    ctx.font = `58px ${font}`
    ctx.textBaseline = 'middle'
    ctx.fillText(text, 8, 76)
    return canvas.toDataURL('image/png')
  }

  const handleAssinarSistema = async () => {
    if (isSubmitting || !selected || !formData) return
    const sig = formData.assinaturaGestor
    if (!sig?.imagemDataUrl) {
      setMessage('Confirme a assinatura no painel «Assinatura do Gestor de Sinistro» (lado direito) com o botão «Confirmar assinatura».')
      return
    }
    setIsSubmitting(true)
    setMessage('A gerar PDF assinado e enviar ao Sinistro...')
    try {
      const tipo = selected.ordemFormularioTipo || 'ordem_reparacao'
      const merged = {
        ...selected.ordemFormularioData,
        ...formData,
        autorizadoPor: formData.assinaturaGestor.nome || session?.name || '',
        dataAutorizacao: formData.dataAutorizacao || new Date().toISOString().slice(0, 10),
      }
      const dataUrl = await ordemQuatacaoPdfToDataUrl(tipo, merged)
      const meta = ORDEM_DOC_TYPES[tipo]
      const updated = assinarComoGestor(selected.id, {
        ordemFormularioData: merged,
        gestorAssinaturaMeta: {
          modo: formData.assinaturaGestor.modo,
          texto: formData.assinaturaGestor.nome,
        },
        gestorAssinadoDocumento: {
          nome: `assinado-${meta?.filePrefix || 'Documento'}-${selected.numeroSinistro}.pdf`,
          tipo: 'application/pdf',
          dataUrl,
          pdfStamped: true,
        },
        gestorAssinadoData: getLocalDateTimeNow(),
        gestorAssinadoPor: session?.name || formData.assinaturaGestor.nome || 'Gestor',
      })
      if (!updated) {
        setMessage('Não foi possível assinar o documento.')
        return
      }
      setVersion((v) => v + 1)
      setSelectedId('')
      setFormData(null)
      setMessage(`Documento assinado e enviado ao Sinistro: ${updated.numeroSinistro}.`)
    } catch (error) {
      setMessage(`Erro ao assinar: ${error?.message || 'falha inesperada'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAssinar = async () => {
    if (isSistemaForm) {
      await handleAssinarSistema()
      return
    }
    if (isSubmitting) return
    if (!selected) {
      setMessage('Selecione um documento pendente.')
      return
    }
    const file = selected.ordemReparacaoDocumento
    if (!file) {
      setMessage('Documento inválido para assinatura.')
      return
    }
    if (!nomeCompleto.trim()) {
      setMessage('Informe o nome completo para assinar.')
      return
    }
    if (modo === 'selo' && !seloDataUrl) {
      setMessage('Carregue o selo da empresa antes de assinar.')
      return
    }
    const assinaturaAsset = getSignatureAsset()
    if (!assinaturaAsset) {
      setMessage('Não foi possível gerar a assinatura.')
      return
    }
    setIsSubmitting(true)
    setMessage('A assinar e enviar para o Sinistro...')
    try {
      const isPdf = String(file?.nome || '').toLowerCase().endsWith('.pdf')
      let stampedPdfDataUrl = ''
      if (isPdf && file?.dataUrl && assinaturaAsset) {
        stampedPdfDataUrl = await createStampedPdfDataUrl({
          pdfDataUrl: file.dataUrl,
          signatureImageDataUrl: assinaturaAsset,
          x: signaturePos.x,
          y: signaturePos.y,
          opacity,
        })
      }
      const fallbackDataUrl = file?.dataUrl || (await readFileAsDataUrl(file))
      const updated = assinarComoGestor(selected.id, {
        gestorAssinaturaMeta: {
          modo,
          fontFamily: FONT_OPTIONS[fontIdx]?.family || 'cursive',
          texto: assinaturaTexto,
          assinaturaImagem: assinaturaAsset,
          opacity,
          x: signaturePos.x,
          y: signaturePos.y,
        },
        gestorAssinadoDocumento: {
          nome: `assinado-${file.nome}`,
          tipo: file.tipo,
          tamanho: file.tamanho,
          sourceField: 'ordemReparacaoDocumento',
          dataUrl: stampedPdfDataUrl || fallbackDataUrl,
          pdfStamped: Boolean(stampedPdfDataUrl),
          assinaturaDigital: {
            modo,
            fontFamily: FONT_OPTIONS[fontIdx]?.family || 'cursive',
            imagemDataUrl: assinaturaAsset,
            opacity,
            x: signaturePos.x,
            y: signaturePos.y,
          },
        },
        gestorAssinadoData: getLocalDateTimeNow(),
        gestorAssinadoPor: session?.name || nomeCompleto || 'Gestor',
      })
      if (!updated) {
        setMessage('Não foi possível assinar o documento.')
        return
      }
      setVersion((v) => v + 1)
      setSelectedId('')
      setMessage(`Documento assinado e enviado ao Sinistro: ${updated.numeroSinistro}.`)
    } catch (error) {
      setMessage(`Erro ao assinar: ${error?.message || 'falha inesperada'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Gestor - Assinatura Digital</h1>
      <p className="form-subtitle">
        Visualize os documentos enviados pelo Sinistro, aplique assinatura digital e envie de volta.
      </p>

      <div className="table users-table credit-premium-table">
        <div className="tr th">
          <div><span className="juridico-th-label"><FaHashtag /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaUserTie /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaFileAlt /> Documento</span></div>
          <div><span className="juridico-th-label"><FaFileSignature /> Ações</span></div>
        </div>
        {pendentes.map((item) => (
          <div key={item.id} className={`tr ${selectedId === item.id ? 'tr-selected' : ''}`}>
            <div className="td-strong credit-col">{item.numeroSinistro}</div>
            <div className="credit-col">{item.cliente}</div>
            <div className="credit-col">{item.ordemReparacaoDocumento?.nome || '--'}</div>
            <div className="action-buttons">
              {item.ordemReparacaoDocumento?.dataUrl && (
                <a className="btn-table" href={item.ordemReparacaoDocumento.dataUrl} download={item.ordemReparacaoDocumento.nome}>
                  <FaDownload /> Baixar
                </a>
              )}
              <button type="button" className="btn-table" onClick={() => setSelectedId(item.id)}>
                <FaFileSignature /> Assinar
              </button>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <section className="form-card form-card--wide" style={{ marginTop: '1rem' }}>
          <h3 style={{ marginTop: 0 }}>
            {selected.numeroSinistro} - {selected.cliente}
          </h3>

          {isSistemaForm && formData && (
            <>
              <p className="form-subtitle">
                Documento criado no sistema — assine no campo reservado à direita («Assinatura do Gestor de Sinistro»).
              </p>
              {selected.ordemReparacaoDocumento?.dataUrl && (
                <iframe
                  title="Pré-visualização do documento"
                  src={selected.ordemReparacaoDocumento.dataUrl}
                  className="ordem-preview-iframe"
                  style={{ marginBottom: '1rem' }}
                />
              )}
              <OrdemQuatacaoFormBuilder
                typeId={selected.ordemFormularioTipo || 'ordem_reparacao'}
                data={formData}
                onChange={setFormData}
                gestorNomeDefault={session?.name || ''}
                gestorSlotMode="edit"
                signaturesOnly
              />
              <button
                type="button"
                className="primary-btn form-btn"
                style={{ marginTop: '0.8rem' }}
                onClick={handleAssinar}
                disabled={isSubmitting}
              >
                <FaCheckCircle /> {isSubmitting ? 'A enviar...' : 'Assinar e enviar para o Sinistro'}
              </button>
            </>
          )}

          {!isSistemaForm && (
          <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <label className="field-group">
              <FaUserTie className="field-icon" />
              <input
                type="text"
                placeholder="Nome completo"
                value={nomeCompleto}
                onChange={(event) => setNomeCompleto(event.target.value)}
              />
            </label>
            <label className="field-group">
              <FaIdCard className="field-icon" />
              <input
                type="text"
                placeholder="Iniciais"
                value={iniciais}
                readOnly
              />
            </label>
          </div>

          <div className="filter-tabs" style={{ marginBottom: '0.7rem', marginTop: '0.8rem' }}>
            {[
              { id: 'assinatura', label: 'Assinatura' },
              { id: 'iniciais', label: 'Iniciais' },
              { id: 'selo', label: 'Selo da Empresa' },
              { id: 'desenhar', label: 'Desenhar Assinatura' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                className={`tab-btn ${modo === item.id ? 'active' : ''}`}
                onClick={() => setModo(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {(modo === 'assinatura' || modo === 'iniciais') && (
            <label className="field-group" style={{ marginBottom: '0.8rem' }}>
              <FaPenFancy className="field-icon" />
              <select
                value={fontIdx}
                onChange={(event) => setFontIdx(Number(event.target.value))}
                style={{ maxHeight: '180px', overflowY: 'auto' }}
              >
                {FONT_OPTIONS.map((font, index) => (
                  <option key={font.id} value={index} style={{ fontFamily: font.family }}>
                    {font.label} - {(assinaturaTexto || 'Assinatura').slice(0, 24)}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="filter-tabs" style={{ marginBottom: '0.8rem' }}>
            {[
              { value: 0.6, label: 'Opacidade 60%' },
              { value: 0.75, label: 'Opacidade 75%' },
              { value: 0.9, label: 'Opacidade 90%' },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className={`tab-btn ${opacity === item.value ? 'active' : ''}`}
                onClick={() => setOpacity(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {modo === 'selo' && (
            <label className="field-group" style={{ marginBottom: '0.8rem' }}>
              <FaUpload className="field-icon" />
              <input
                type="file"
                accept=".png,.jpg,.jpeg,.webp,.svg"
                onChange={async (event) => {
                  const file = event.target.files?.[0] || null
                  setSeloFile(file)
                  if (!file) {
                    setSeloDataUrl('')
                    return
                  }
                  try {
                    const dataUrl = await readFileAsDataUrl(file)
                    setSeloDataUrl(dataUrl)
                  } catch {
                    setSeloDataUrl('')
                  }
                }}
              />
            </label>
          )}

          {modo === 'desenhar' && (
            <div style={{ marginBottom: '0.8rem' }}>
              <canvas
                ref={drawCanvasRef}
                width={520}
                height={140}
                onMouseDown={handleCanvasDown}
                onMouseMove={handleCanvasMove}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{ border: '1px dashed #ced9e6', borderRadius: '10px', width: '100%', background: 'transparent' }}
              />
              <button type="button" className="btn-table" style={{ marginTop: '0.5rem' }} onClick={clearCanvas}>
                Limpar desenho
              </button>
            </div>
          )}

          <div
            ref={containerRef}
            style={{
              position: 'relative',
              minHeight: '360px',
              border: '1px solid #d9e3ed',
              borderRadius: '10px',
              overflow: 'hidden',
              background: '#fff',
            }}
          >
            {selected.ordemReparacaoDocumento?.nome?.toLowerCase().endsWith('.pdf') && (
              <iframe
                title="Documento para assinatura"
                src={selected.ordemReparacaoDocumento.dataUrl}
                style={{ width: '100%', height: '360px', border: 'none' }}
              />
            )}
            {selected.ordemReparacaoDocumento?.nome?.toLowerCase().endsWith('.docx') && (
              <div style={{ padding: '0.9rem' }} dangerouslySetInnerHTML={{ __html: docHtml || '<p>A carregar documento...</p>' }} />
            )}
            {!selected.ordemReparacaoDocumento?.nome?.toLowerCase().endsWith('.pdf') &&
              !selected.ordemReparacaoDocumento?.nome?.toLowerCase().endsWith('.docx') && (
              <div style={{ padding: '0.9rem' }}>
                Visualização interna indisponível para este formato. Use "Baixar" para verificar e depois assinar.
              </div>
            )}

            <div
              ref={assinaturaRef}
              role="button"
              tabIndex={0}
              onMouseDown={startDrag}
              style={{
                position: 'absolute',
                top: signaturePos.y,
                left: signaturePos.x,
                padding: '0.15rem 0.35rem',
                borderRadius: '6px',
                border: '1px dashed rgba(32, 111, 192, 0.5)',
                background: 'transparent',
                fontFamily: FONT_OPTIONS[fontIdx]?.family || 'cursive',
                cursor: 'grab',
                userSelect: 'none',
              }}
            >
              {modo === 'selo' && seloDataUrl ? (
                <img
                  src={seloDataUrl}
                  alt="Selo"
                  style={{ maxHeight: '62px', maxWidth: '160px', background: 'transparent', opacity }}
                />
              ) : modo === 'desenhar' ? (
                <img
                  src={drawCanvasRef.current?.toDataURL('image/png') || ''}
                  alt="Assinatura desenhada"
                  style={{ maxHeight: '62px', maxWidth: '180px', background: 'transparent', opacity }}
                />
              ) : (
                <span style={{ opacity }}>{assinaturaTexto}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            className="primary-btn form-btn"
            style={{ marginTop: '0.8rem' }}
            onClick={handleAssinar}
            disabled={isSubmitting}
          >
            <FaCheckCircle /> {isSubmitting ? 'A enviar...' : 'Assinar e enviar para o Sinistro'}
          </button>
          </>
          )}
        </section>
      )}
      {message && <p className="form-message" style={{ marginTop: '0.8rem' }}>{message}</p>}
    </div>
  )
}
