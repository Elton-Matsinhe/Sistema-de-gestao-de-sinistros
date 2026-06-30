import { useEffect, useRef, useState } from 'react'
import { FaEraser, FaFileSignature } from 'react-icons/fa'

function MiniAssinatura({ label, value, onChange }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !value?.imagemDataUrl) return
    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    }
    img.src = value.imagemDataUrl
  }, [value])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const cx = e.touches ? e.touches[0].clientX : e.clientX
    const cy = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: ((cx - rect.left) / rect.width) * canvas.width,
      y: ((cy - rect.top) / rect.height) * canvas.height,
    }
  }

  const start = (e) => {
    e.preventDefault()
    setDrawing(true)
    const ctx = canvasRef.current.getContext('2d')
    ctx.lineWidth = 2
    ctx.strokeStyle = '#1a3d2e'
    ctx.lineCap = 'round'
    const p = getPos(e)
    ctx.beginPath()
    ctx.moveTo(p.x, p.y)
  }

  const move = (e) => {
    if (!drawing) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = getPos(e)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
  }

  const end = () => {
    if (!drawing) return
    setDrawing(false)
    onChange({
      imagemDataUrl: canvasRef.current.toDataURL('image/png'),
      data: new Date().toISOString(),
    })
  }

  const limpar = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    onChange(null)
  }

  return (
    <div className="mini-assinatura">
      <label>{label}</label>
      <canvas
        ref={canvasRef}
        width={280}
        height={90}
        className="mini-assinatura__canvas"
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      <button type="button" className="btn-table mini-assinatura__clear" onClick={limpar}>
        <FaEraser /> Limpar
      </button>
    </div>
  )
}

export default function CondutoresAssinaturaCentro({
  ambosCondutoresAssinaram,
  assinaturaA,
  assinaturaB,
  onChange,
}) {
  return (
    <div className="condutores-assinatura-centro">
      <div className="pontos-embate-panel__header">15. Assinatura dos Condutores</div>
      <p className="condutores-assinatura-pergunta">
        Ambos os condutores assinaram?
        <label>
          <input
            type="radio"
            name="ambosAssinaram"
            checked={ambosCondutoresAssinaram === 'Sim'}
            onChange={() => onChange('ambosCondutoresAssinaram', 'Sim')}
          />
          Sim
        </label>
        <label>
          <input
            type="radio"
            name="ambosAssinaram"
            checked={ambosCondutoresAssinaram === 'Não'}
            onChange={() => onChange('ambosCondutoresAssinaram', 'Não')}
          />
          Não
        </label>
      </p>
      <div className="condutores-assinatura-pads">
        <MiniAssinatura
          label="Condutor Veículo A"
          value={assinaturaA}
          onChange={(v) => onChange('assinaturaCondutorA', v)}
        />
        <MiniAssinatura
          label="Condutor Veículo B"
          value={assinaturaB}
          onChange={(v) => onChange('assinaturaCondutorB', v)}
        />
      </div>
      <p className="condutores-assinatura-hint">
        <FaFileSignature /> Desenhe a assinatura directamente no painel
      </p>
    </div>
  )
}
