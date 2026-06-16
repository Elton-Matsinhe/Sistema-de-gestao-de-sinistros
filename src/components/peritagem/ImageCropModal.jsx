import { useEffect, useRef, useState } from 'react'
import { FaCheck, FaTimes } from 'react-icons/fa'

export default function ImageCropModal({ imageSrc, onCancel, onConfirm }) {
  const canvasRef = useRef(null)
  const imgRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [start, setStart] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      draw()
    }
    img.src = imageSrc
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageSrc, zoom, offset])

  const draw = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    const size = 320
    canvas.width = size
    canvas.height = size
    ctx.fillStyle = '#edf5f0'
    ctx.fillRect(0, 0, size, size)
    const scale = zoom
    const w = img.width * scale
    const h = img.height * scale
    const x = (size - w) / 2 + offset.x
    const y = (size - h) / 2 + offset.y
    ctx.drawImage(img, x, y, w, h)
    ctx.strokeStyle = '#1f8f5f'
    ctx.lineWidth = 2
    ctx.strokeRect(40, 40, size - 80, size - 80)
  }

  const handlePointerDown = (event) => {
    setDragging(true)
    setStart({ x: event.clientX - offset.x, y: event.clientY - offset.y })
  }

  const handlePointerMove = (event) => {
    if (!dragging) return
    setOffset({ x: event.clientX - start.x, y: event.clientY - start.y })
  }

  const handleApply = () => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return
    const crop = document.createElement('canvas')
    const cropSize = 240
    crop.width = cropSize
    crop.height = cropSize
    const ctx = crop.getContext('2d')
    const size = 320
    const scale = zoom
    const w = img.width * scale
    const h = img.height * scale
    const x = (size - w) / 2 + offset.x
    const y = (size - h) / 2 + offset.y
    const sx = ((40 - x) / w) * img.width
    const sy = ((40 - y) / h) * img.height
    const sw = ((size - 80) / w) * img.width
    const sh = ((size - 80) / h) * img.height
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cropSize, cropSize)
    onConfirm(crop.toDataURL('image/jpeg', 0.85))
  }

  return (
    <div className="crop-modal-overlay" role="dialog" aria-modal="true">
      <div className="crop-modal">
        <h3>Recortar imagem</h3>
        <p className="form-subtitle">Arraste a imagem e ajuste o zoom para enquadrar a zona do veículo.</p>
        <canvas
          ref={canvasRef}
          className="crop-canvas"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={() => setDragging(false)}
          onMouseLeave={() => setDragging(false)}
        />
        <label className="crop-zoom-label">
          Zoom
          <input type="range" min="0.5" max="2.5" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))} />
        </label>
        <div className="action-buttons">
          <button type="button" className="btn-table" onClick={onCancel}>
            <FaTimes /> Cancelar
          </button>
          <button type="button" className="primary-btn" onClick={handleApply}>
            <FaCheck /> Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  )
}
