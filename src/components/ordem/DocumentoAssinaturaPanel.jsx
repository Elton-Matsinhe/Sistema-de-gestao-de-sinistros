import { useEffect, useRef, useState } from 'react'
import { FaEraser, FaFileSignature, FaLock, FaPenFancy, FaCheckCircle, FaRedo } from 'react-icons/fa'
import { SIGNATURE_FONT_OPTIONS, renderSignatureToDataUrl } from '../../utils/signatureFonts'

export default function DocumentoAssinaturaPanel({
  title,
  subtitle,
  value,
  onChange,
  nomeDefault = '',
  onNomeConfirm,
  readOnly = false,
  reservedPlaceholder = false,
}) {
  const [modo, setModo] = useState(value?.modo || 'desenho')
  const [nome, setNome] = useState(value?.nome || nomeDefault || '')
  const [fontIdx, setFontIdx] = useState(0)
  const [desenhando, setDesenhando] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [editing, setEditing] = useState(!value?.imagemDataUrl)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
    if (nomeDefault && !value?.nome) setNome(nomeDefault)
  }, [nomeDefault, value?.nome])

  useEffect(() => {
    if (value?.imagemDataUrl) setEditing(false)
  }, [value?.imagemDataUrl])

  useEffect(() => {
    if (readOnly || !editing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 2.2
    ctx.strokeStyle = '#1a3d2e'
    ctxRef.current = ctx

    if (value?.modo === 'desenho' && value?.imagemDataUrl) {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = value.imagemDataUrl
    }
  }, [value, readOnly, editing])

  const getPos = (event) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = event.touches ? event.touches[0].clientX : event.clientX
    const clientY = event.touches ? event.touches[0].clientY : event.clientY
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDraw = (event) => {
    if (readOnly) return
    event.preventDefault()
    setDesenhando(true)
    const pos = getPos(event)
    ctxRef.current?.beginPath()
    ctxRef.current?.moveTo(pos.x, pos.y)
  }

  const draw = (event) => {
    if (!desenhando || readOnly) return
    event.preventDefault()
    const pos = getPos(event)
    ctxRef.current?.lineTo(pos.x, pos.y)
    ctxRef.current?.stroke()
  }

  const endDraw = () => setDesenhando(false)

  const limpar = () => {
    if (readOnly) return
    const canvas = canvasRef.current
    ctxRef.current?.clearRect(0, 0, canvas.width, canvas.height)
    onChange?.(null)
    setEditing(true)
    setFeedback('')
  }

  const confirmar = (payload) => {
    if (!onChange) {
      setFeedback('Não foi possível guardar a assinatura.')
      return
    }
    onChange(payload)
    onNomeConfirm?.(payload.nome)
    setEditing(false)
    setFeedback('Assinatura confirmada com sucesso.')
  }

  const confirmarDesenho = () => {
    if (!canvasRef.current) return
    const imagemDataUrl = canvasRef.current.toDataURL('image/png')
    confirmar({
      modo: 'desenho',
      nome: nome.trim() || nomeDefault || 'Signatário',
      imagemDataUrl,
      data: new Date().toISOString(),
    })
  }

  const confirmarTexto = () => {
    if (!nome.trim()) {
      setFeedback('Indique o nome antes de confirmar.')
      return
    }
    const font = SIGNATURE_FONT_OPTIONS[fontIdx]
    confirmar({
      modo: 'texto',
      nome: nome.trim(),
      fontFamily: font.family,
      fontId: font.id,
      imagemDataUrl: renderSignatureToDataUrl(nome.trim(), font.family),
      data: new Date().toISOString(),
    })
  }

  const assinado = Boolean(value?.imagemDataUrl)
  const font = SIGNATURE_FONT_OPTIONS[fontIdx]

  const previewLayout = (
    <div className="documento-assinatura-pdf-layout">
      {assinado ? (
        <div className="documento-assinatura-pdf-layout__sig">
          <img src={value.imagemDataUrl} alt={title} />
        </div>
      ) : reservedPlaceholder ? (
        <div className="documento-assinatura-pdf-layout__sig documento-assinatura-pdf-layout__sig--empty">
          <FaLock aria-hidden="true" />
          <span>Aguarda assinatura do gestor</span>
        </div>
      ) : null}
      <div className="documento-assinatura-pdf-layout__line" aria-hidden="true" />
      {assinado && (
        <small className="documento-assinatura-pdf-layout__meta">
          <span className="documento-assinatura-pdf-layout__meta-name">{value.nome}</span>
          <span className="documento-assinatura-pdf-layout__meta-sep">·</span>
          <span>{value.data ? new Date(value.data).toLocaleString('pt-PT') : ''}</span>
          <span className="documento-assinatura-pdf-layout__meta-sep">·</span>
          <span>{value.modo === 'texto' ? 'Tipográfica' : 'Desenho'}</span>
        </small>
      )}
    </div>
  )

  const head = (
    <div className="participacao-assinatura-panel__head documento-assinatura-panel__head">
      <FaFileSignature aria-hidden="true" />
      <div className="documento-assinatura-panel__titles">
        <h4>{title}</h4>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {assinado && (
        <span className="participacao-assinatura-badge">
          <FaCheckCircle /> Assinado
        </span>
      )}
    </div>
  )

  if (readOnly) {
    return (
      <section className="participacao-assinatura-panel documento-assinatura-panel documento-assinatura-panel--readonly">
        {head}
        {previewLayout}
      </section>
    )
  }

  return (
    <section className="participacao-assinatura-panel documento-assinatura-panel">
      {head}

      {assinado && !editing ? (
        <div className="documento-assinatura-signed-view">
          {previewLayout}
          <button type="button" className="btn-table documento-assinatura-reedit-btn" onClick={() => setEditing(true)}>
            <FaRedo /> Alterar assinatura
          </button>
        </div>
      ) : (
        <>
          <div className="participacao-assinatura-modes documento-assinatura-modes">
            <button
              type="button"
              className={`participacao-mode-btn ${modo === 'desenho' ? 'active' : ''}`}
              onClick={() => setModo('desenho')}
            >
              <FaPenFancy /> Desenhar / Rubrica
            </button>
            <button
              type="button"
              className={`participacao-mode-btn ${modo === 'texto' ? 'active' : ''}`}
              onClick={() => setModo('texto')}
            >
              <FaFileSignature /> Tipográfica
            </button>
          </div>

          <label className="field-group participacao-field field-full documento-assinatura-nome-field">
            <FaFileSignature className="field-icon" />
            <input
              type="text"
              placeholder="Nome completo do signatário"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </label>

          {modo === 'desenho' ? (
            <div className="participacao-canvas-wrap documento-assinatura-canvas-wrap">
              <canvas
                ref={canvasRef}
                width={640}
                height={180}
                className="participacao-signature-canvas"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              <div className="participacao-canvas-actions">
                <button type="button" className="btn-table" onClick={limpar}>
                  <FaEraser /> Limpar
                </button>
                <button type="button" className="primary-btn" onClick={confirmarDesenho}>
                  Confirmar assinatura
                </button>
              </div>
            </div>
          ) : (
            <div className="participacao-text-signature">
              <label className="documento-assinatura-font-label">
                Fonte ({SIGNATURE_FONT_OPTIONS.length} opções)
              </label>
              <select
                value={fontIdx}
                onChange={(e) => setFontIdx(Number(e.target.value))}
                className="participacao-font-select documento-assinatura-font-select"
              >
                {SIGNATURE_FONT_OPTIONS.map((f, i) => (
                  <option key={f.id} value={i}>
                    {f.label}
                  </option>
                ))}
              </select>
              <div
                className="participacao-text-preview documento-assinatura-preview"
                style={{ fontFamily: font.family }}
              >
                {nome.trim() || 'Pré-visualização'}
              </div>
              <button type="button" className="primary-btn" onClick={confirmarTexto} disabled={!nome.trim()}>
                Aplicar assinatura tipográfica
              </button>
            </div>
          )}
        </>
      )}

      {feedback && <p className="documento-assinatura-feedback">{feedback}</p>}
    </section>
  )
}
