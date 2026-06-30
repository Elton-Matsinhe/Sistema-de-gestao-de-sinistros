import { useMemo } from 'react'
import ParticipacaoField from '../participacao/ParticipacaoField'
import DualAssinaturaSection from './DualAssinaturaSection'
import {
  FaCalendarAlt,
  FaCar,
  FaFileAlt,
  FaHashtag,
  FaMapMarkerAlt,
  FaRegUser,
} from 'react-icons/fa'
import {
  ORDEM_DOC_TYPES,
  ORDEM_REPARACAO_SECTIONS,
  QUITACAO_FIELDS,
} from '../../utils/ordemQuatacaoConfig'

const ICON_MAP = {
  oficina: FaCar,
  numeroReferencia: FaHashtag,
  dataCotacao: FaCalendarAlt,
  pessoaContacto: FaRegUser,
  numeroApolice: FaHashtag,
  marcaModelo: FaCar,
  numeroRegistro: FaHashtag,
  numeroSinistro: FaHashtag,
  franquia: FaHashtag,
  valorCotacao: FaHashtag,
  valorLiquidoUnicar: FaHashtag,
}

function fieldProps(f) {
  const base = {
    id: f.id,
    label: f.label,
    icon: ICON_MAP[f.id] || FaFileAlt,
  }
  if (f.type === 'date') return { ...base, type: 'date' }
  if (f.type === 'currency') return { ...base, type: 'number', numeric: true }
  if (f.type === 'textarea') return { ...base, type: 'textarea' }
  return base
}

function patchData(onChange, data, patch) {
  if (typeof onChange !== 'function') return
  try {
    onChange((prev) => ({ ...(prev || data || {}), ...patch }))
  } catch {
    onChange({ ...(data || {}), ...patch })
  }
}

export function AssinaturasBlock({ typeId, data, onChange, gestorNomeDefault, gestorSlotMode = 'reserved' }) {
  const declaranteDefault = useMemo(() => {
    if (typeId === 'quitacao') return data?.segurado || data?.beneficiario || ''
    return data?.pessoaContacto || ''
  }, [typeId, data])

  const gestorReadOnly = gestorSlotMode !== 'edit'
  const declaranteReadOnly = gestorSlotMode === 'edit' || gestorSlotMode === 'signed' || gestorSlotMode === 'sent'

  const gestorOnChange = gestorSlotMode === 'edit'
    ? (sig) => {
        patchData(onChange, data, {
          assinaturaGestor: sig,
          ...(sig?.nome ? { autorizadoPor: sig.nome } : {}),
        })
      }
    : undefined

  return (
    <DualAssinaturaSection
      declaranteValue={data?.assinaturaDeclarante}
      onDeclaranteChange={
        declaranteReadOnly
          ? undefined
          : (sig) => patchData(onChange, data, { assinaturaDeclarante: sig })
      }
      declaranteNomeDefault={declaranteDefault}
      declaranteReadOnly={declaranteReadOnly}
      gestorValue={data?.assinaturaGestor}
      gestorNomeDefault={data?.autorizadoPor || gestorNomeDefault}
      gestorReadOnly={gestorReadOnly}
      onGestorChange={gestorOnChange}
      showGestorDate={typeId === 'ordem_reparacao'}
      dataAutorizacao={data?.dataAutorizacao}
      onDataAutorizacaoChange={
        gestorSlotMode === 'edit'
          ? (val) => patchData(onChange, data, { dataAutorizacao: val })
          : undefined
      }
    />
  )
}

export default function OrdemQuatacaoFormBuilder({
  typeId,
  data,
  onChange,
  gestorNomeDefault = '',
  gestorSlotMode = 'reserved',
  signaturesOnly = false,
}) {
  const set = (key, val) => patchData(onChange, data, { [key]: val })

  const sections = useMemo(() => {
    if (typeId === 'ordem_reparacao') return ORDEM_REPARACAO_SECTIONS
    return null
  }, [typeId])

  if (signaturesOnly) {
    return (
      <AssinaturasBlock
        typeId={typeId}
        data={data}
        onChange={onChange}
        gestorNomeDefault={gestorNomeDefault}
        gestorSlotMode={gestorSlotMode}
      />
    )
  }

  if (typeId === 'quitacao') {
    return (
      <div className="ordem-form-builder">
        <div className="ordem-form-builder__intro">
          <span className="ordem-form-type-pill" style={{ background: ORDEM_DOC_TYPES.quitacao.color }}>
            {ORDEM_DOC_TYPES.quitacao.pdfTitle}
          </span>
          <p className="form-subtitle">{ORDEM_DOC_TYPES.quitacao.subtitle}</p>
        </div>
        <div className="participacao-form-section">
          {QUITACAO_FIELDS.map((f) => (
            <ParticipacaoField
              key={f.id}
              field={fieldProps(f)}
              value={data?.[f.id] ?? f.default ?? ''}
              onChange={(v) => set(f.id, v)}
              span={f.type === 'textarea' ? 'full' : 1}
            />
          ))}
        </div>
        <div className="ordem-form-assinatura-row participacao-form-section">
          <ParticipacaoField
            field={{ id: 'localDocumento', label: 'Local (datado em)', icon: FaMapMarkerAlt }}
            value={data?.localDocumento ?? 'Maputo'}
            onChange={(v) => set('localDocumento', v)}
          />
          <ParticipacaoField
            field={{ id: 'diaAssinatura', label: 'Dia', icon: FaCalendarAlt, numeric: true }}
            value={data?.diaAssinatura ?? ''}
            onChange={(v) => set('diaAssinatura', v)}
          />
          <ParticipacaoField
            field={{ id: 'mesAssinatura', label: 'Mês', icon: FaCalendarAlt }}
            value={data?.mesAssinatura ?? ''}
            onChange={(v) => set('mesAssinatura', v)}
          />
          <ParticipacaoField
            field={{ id: 'anoAssinatura', label: 'Ano', icon: FaCalendarAlt, numeric: true }}
            value={data?.anoAssinatura ?? ''}
            onChange={(v) => set('anoAssinatura', v)}
          />
        </div>

        <AssinaturasBlock
          typeId={typeId}
          data={data}
          onChange={onChange}
          gestorNomeDefault={gestorNomeDefault}
          gestorSlotMode={gestorSlotMode}
        />
      </div>
    )
  }

  return (
    <div className="ordem-form-builder">
      <div className="ordem-form-builder__intro">
        <span className="ordem-form-type-pill" style={{ background: ORDEM_DOC_TYPES.ordem_reparacao.color }}>
          {ORDEM_DOC_TYPES.ordem_reparacao.pdfTitle}
        </span>
      </div>
      {sections?.map((sec) => (
        <section key={sec.title} className="ordem-form-section-block">
          <h4 className="ordem-form-section-block__title">{sec.title}</h4>
          <div className="participacao-form-section">
            {sec.fields.map((f) => (
              <ParticipacaoField
                key={f.id}
                field={fieldProps(f)}
                value={data?.[f.id] ?? ''}
                onChange={(v) => set(f.id, v)}
              />
            ))}
          </div>
        </section>
      ))}

      <AssinaturasBlock
        typeId={typeId}
        data={data}
        onChange={onChange}
        gestorNomeDefault={gestorNomeDefault}
        gestorSlotMode={gestorSlotMode}
      />
    </div>
  )
}
