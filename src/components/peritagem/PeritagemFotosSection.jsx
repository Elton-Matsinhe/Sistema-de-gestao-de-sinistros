import { useRef, useState } from 'react'
import { FaCamera, FaCrop, FaImages, FaSave, FaTrash } from 'react-icons/fa'
import { PHOTO_SLOTS, compressImageDataUrl } from '../../utils/peritagemDefaults'
import CarPositionIcon from './CarPositionIcon'
import ImageCropModal from './ImageCropModal'

export default function PeritagemFotosSection({ fotos, onChange, onSave, saving, readOnly = false, hideHeader = false }) {
  const [cropSrc, setCropSrc] = useState('')
  const [cropSlot, setCropSlot] = useState('')
  const cameraRefs = useRef({})
  const galleryRefs = useRef({})

  const getFoto = (slotId) => fotos.find((f) => f.slotId === slotId) || null

  const handleFile = async (slotId, file) => {
    if (!file || readOnly) return
    const reader = new FileReader()
    reader.onload = () => {
      setCropSlot(slotId)
      setCropSrc(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const applyCrop = async (croppedDataUrl) => {
    const compressed = await compressImageDataUrl(croppedDataUrl)
    const slot = PHOTO_SLOTS.find((s) => s.id === cropSlot)
    const next = fotos.filter((f) => f.slotId !== cropSlot)
    next.push({
      slotId: cropSlot,
      label: slot?.label || '',
      dataUrl: compressed,
      nome: `${cropSlot}.jpg`,
    })
    onChange(next)
    setCropSrc('')
    setCropSlot('')
  }

  const removeFoto = (slotId) => {
    if (readOnly) return
    onChange(fotos.filter((f) => f.slotId !== slotId))
  }

  const filled = fotos.filter((f) => f.dataUrl).length

  return (
    <div className="peritagem-form-wrap peritagem-form-wrap--full">
      {!hideHeader && (
        <div className="peritagem-form-header">
          <h2>Registo Fotográfico</h2>
          <p>Tire fotos com a câmara ou carregue da galeria. Pode recortar cada imagem antes de guardar.</p>
        </div>
      )}

      <div className="fotos-grid fotos-grid--wide">
        {PHOTO_SLOTS.map((slot) => {
          const foto = getFoto(slot.id)
          return (
            <div key={slot.id} className={`foto-slot ${foto ? 'foto-slot--filled' : ''}`}>
              <div className="foto-slot__diagram">
                <CarPositionIcon view={slot.view} />
              </div>
              <p className="foto-slot__label">{slot.label}</p>
              {foto?.dataUrl ? (
                <div className="foto-slot__preview">
                  <img src={foto.dataUrl} alt={slot.label} />
                  {!readOnly && (
                    <div className="foto-slot__actions">
                      <button type="button" className="btn-table" onClick={() => cameraRefs.current[slot.id]?.click()}>
                        <FaCamera /> Nova foto
                      </button>
                      <button type="button" className="btn-table" onClick={() => galleryRefs.current[slot.id]?.click()}>
                        <FaImages /> Galeria
                      </button>
                      <button type="button" className="btn-icon-danger" onClick={() => removeFoto(slot.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !readOnly && (
                  <div className="foto-slot__upload-group">
                    <button type="button" className="foto-slot__upload foto-slot__upload--camera" onClick={() => cameraRefs.current[slot.id]?.click()}>
                      <FaCamera />
                      <span>Tirar foto</span>
                    </button>
                    <button type="button" className="foto-slot__upload foto-slot__upload--gallery" onClick={() => galleryRefs.current[slot.id]?.click()}>
                      <FaImages />
                      <span>Carregar imagem</span>
                    </button>
                  </div>
                )
              )}
              {!readOnly && (
                <>
                  <input
                    ref={(el) => { cameraRefs.current[slot.id] = el }}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    hidden
                    onChange={(e) => {
                      handleFile(slot.id, e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                  <input
                    ref={(el) => { galleryRefs.current[slot.id] = el }}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      handleFile(slot.id, e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </>
              )}
            </div>
          )
        })}
      </div>

      <p className="fotos-progress">{filled} de 6 fotos carregadas</p>

      {!readOnly && (
        <button type="button" className="primary-btn form-btn peritagem-save-btn" onClick={onSave} disabled={saving || filled < 6}>
          <FaSave />
          {saving ? 'A guardar...' : 'Guardar fotos'}
        </button>
      )}

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          onCancel={() => { setCropSrc(''); setCropSlot('') }}
          onConfirm={applyCrop}
        />
      )}
    </div>
  )
}
