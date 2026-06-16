import PeritagemFormularioSection from './PeritagemFormularioSection'
import PeritagemMateriaisSection from './PeritagemMateriaisSection'
import { PHOTO_SLOTS } from '../../utils/peritagemDefaults'

export default function PeritagemRelatorioPreview({ process }) {
  const form = process?.peritagemFormulario || process?.peritagemRelatorio?.formulario
  const materiais = process?.peritagemMateriais || process?.peritagemRelatorio?.materiais
  const fotos = process?.peritagemFotos?.fotos || process?.peritagemRelatorio?.fotos?.fotos || []

  if (!form) {
    return <p className="form-subtitle">Relatório pericial ainda não disponível.</p>
  }

  return (
    <div className="peritagem-relatorio-preview">
      <PeritagemFormularioSection form={form} onChange={() => {}} readOnly />
      {materiais && (
        <PeritagemMateriaisSection
          data={{
            pecas: materiais.pecas || [],
            descontoPecas: materiais.descontoPecas || '',
            maoObra: materiais.maoObra || [],
            descontoMaoObra: materiais.descontoMaoObra || '',
          }}
          onChange={() => {}}
          readOnly
        />
      )}
      {fotos.length > 0 && (
        <section className="peritagem-section">
          <h3>Fotos da Peritagem</h3>
          <div className="fotos-grid fotos-grid--preview">
            {PHOTO_SLOTS.map((slot) => {
              const foto = fotos.find((f) => f.slotId === slot.id)
              return (
                <div key={slot.id} className="foto-slot foto-slot--filled">
                  <p className="foto-slot__label">{slot.label}</p>
                  {foto?.dataUrl ? (
                    <div className="foto-slot__preview">
                      <img src={foto.dataUrl} alt={slot.label} />
                    </div>
                  ) : (
                    <p className="form-subtitle">Sem foto</p>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
