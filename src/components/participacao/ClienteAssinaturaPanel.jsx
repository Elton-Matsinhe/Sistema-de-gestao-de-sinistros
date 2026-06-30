import { useEffect, useRef, useState } from 'react'
import { FaEraser, FaFileSignature, FaPenFancy, FaCheckCircle } from 'react-icons/fa'

const FONT_OPTIONS = [
  { id: 'caveat', label: 'Manuscrito', family: '"Caveat", "Segoe Script", cursive' },
  { id: 'dancing', label: 'Elegante', family: '"Dancing Script", cursive' },
  { id: 'poppins', label: 'Formal', family: '"Poppins", "Segoe UI", sans-serif' },
]

export default function ClienteAssinaturaPanel({ value, onChange, nomeCliente = '' }) {
  const [modo, setModo] = useState('desenho')
  const [nome, setNome] = useState(value?.nome || nomeCliente || '')
  const [fontIdx, setFontIdx] = useState(0)
  const [desenhando, setDesenhando] = useState(false)
  const canvasRef = useRef(null)
  const ctxRef = useRef(null)

  useEffect(() => {
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
  }, [value])

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
    event.preventDefault()
    setDesenhando(true)
    const pos = getPos(event)
    const ctx = ctxRef.current
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = (event) => {
    if (!desenhando) return
    event.preventDefault()
    const pos = getPos(event)
    const ctx = ctxRef.current
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
  }

  const endDraw = () => setDesenhando(false)

  const limpar = () => {
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange(null)
  }

  const confirmarDesenho = () => {
    const canvas = canvasRef.current
    const imagemDataUrl = canvas.toDataURL('image/png')
    onChange({
      modo: 'desenho',
      nome: nome.trim(),
      imagemDataUrl,
      data: new Date().toISOString(),
    })
  }

  const confirmarTexto = () => {
    if (!nome.trim()) return
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 120
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#1a3d2e'
    ctx.font = `42px ${FONT_OPTIONS[fontIdx].family}`
    ctx.textBaseline = 'middle'
    ctx.fillText(nome.trim(), 24, canvas.height / 2)
    onChange({
      modo: 'texto',
      nome: nome.trim(),
      fontFamily: FONT_OPTIONS[fontIdx].family,
      imagemDataUrl: canvas.toDataURL('image/png'),
      data: new Date().toISOString(),
    })
  }

  const assinado = Boolean(value?.imagemDataUrl)

  return (
    <section className="participacao-assinatura-panel">
      <div className="participacao-assinatura-panel__head">
        <FaFileSignature aria-hidden="true" />
        <div>
          <h4>Assinatura digital do cliente</h4>
          <p>Desenhe no painel ou utilize assinatura tipográfica com o nome completo.</p>
        </div>
        {assinado && (
          <span className="participacao-assinatura-badge">
            <FaCheckCircle /> Assinado
          </span>
        )}
      </div>

      <div className="participacao-assinatura-modes">
        <button
          type="button"
          className={`participacao-mode-btn ${modo === 'desenho' ? 'active' : ''}`}
          onClick={() => setModo('desenho')}
        >
          <FaPenFancy /> Desenhar
        </button>
        <button
          type="button"
          className={`participacao-mode-btn ${modo === 'texto' ? 'active' : ''}`}
          onClick={() => setModo('texto')}
        >
          <FaFileSignature /> Assinatura tipográfica
        </button>
      </div>

      <label className="field-group participacao-field field-full">
        <FaFileSignature className="field-icon" />
        <input
          type="text"
          placeholder="Nome completo do signatário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <small>Nome do cliente / segurado</small>
      </label>

      {modo === 'desenho' ? (
        <div className="participacao-canvas-wrap">
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
          <select
            value={fontIdx}
            onChange={(e) => setFontIdx(Number(e.target.value))}
            className="participacao-font-select"
          >
            {FONT_OPTIONS.map((f, i) => (
              <option key={f.id} value={i}>
                {f.label}
              </option>
            ))}
          </select>
          <div
            className="participacao-text-preview"
            style={{ fontFamily: FONT_OPTIONS[fontIdx].family }}
          >
            {nome.trim() || 'Pré-visualização da assinatura'}
          </div>
          <button type="button" className="primary-btn" onClick={confirmarTexto}>
            Aplicar assinatura tipográfica
          </button>
        </div>
      )}

      {assinado && value?.imagemDataUrl && (
        <div className="participacao-assinatura-preview">
          <img src={value.imagemDataUrl} alt="Assinatura do cliente" />
          <small>
            {value.nome} — {new Date(value.data).toLocaleString('pt-PT')}
          </small>
        </div>
      )}
    </section>
  )
}
