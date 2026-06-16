import { useEffect, useMemo, useState } from 'react'
import {
  FaCalendarAlt,
  FaCamera,
  FaCheckCircle,
  FaClipboardList,
  FaHashtag,
  FaImages,
  FaMoneyBillWave,
  FaPaperPlane,
  FaPen,
  FaTools,
  FaUserTie,
} from 'react-icons/fa'
import { useSearchParams } from 'react-router-dom'
import PeritagemDataTable from '../components/peritagem/PeritagemDataTable'
import PeritagemFormularioSection from '../components/peritagem/PeritagemFormularioSection'
import PeritagemMateriaisSection from '../components/peritagem/PeritagemMateriaisSection'
import PeritagemFotosSection from '../components/peritagem/PeritagemFotosSection'
import { getLoggedUserName } from '../components/AutoLoggedUserField'
import { getLocalDateTimeNow } from '../utils/datetime'
import {
  buildFormularioFromProcess,
  calcMateriaisTotals,
  emptyMateriaisForm,
  PHOTO_SLOTS,
} from '../utils/peritagemDefaults'
import {
  printPeritagemFormulario,
  printPeritagemFotos,
  printPeritagemMateriais,
  printPeritagemRelatorioCompleto,
} from '../utils/peritagemPrint'
import {
  deletePeritagemFormulario,
  deletePeritagemFotos,
  deletePeritagemMateriais,
  enviarPeritagemRelatorio,
  getPeritoCompletedProcesses,
  getPeritoFotosGuardadas,
  getPeritoFormulariosGuardados,
  getPeritoMateriaisGuardados,
  getPeritoPendingProcesses,
  savePeritagemFormulario,
  savePeritagemFotos,
  savePeritagemMateriais,
} from '../utils/processes'

const TABS = [
  {
    id: 'formulario',
    label: 'Formulário de Peritagem',
    description: 'Preencha todos os campos conforme a inspecção realizada no veículo.',
    icon: <FaClipboardList />,
  },
  {
    id: 'materiais',
    label: 'Materiais e Mão de Obra',
    description: 'Valores sem IVA. Adicione linhas conforme a cotação da oficina.',
    icon: <FaTools />,
  },
  {
    id: 'fotos',
    label: 'Fotos do Veículo',
    description: 'Tire fotos com a câmara ou carregue da galeria nas 6 posições indicadas.',
    icon: <FaCamera />,
  },
]

export default function PeritoUploadPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [version, setVersion] = useState(0)
  const [selectedId, setSelectedId] = useState(searchParams.get('id') || '')
  const [activeTab, setActiveTab] = useState('formulario')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewMode, setViewMode] = useState(null)
  const [formulario, setFormulario] = useState(null)
  const [materiais, setMateriais] = useState(emptyMateriaisForm())
  const [fotos, setFotos] = useState([])

  const pendingProcesses = useMemo(() => getPeritoPendingProcesses(), [version])
  const completedProcesses = useMemo(() => getPeritoCompletedProcesses(), [version])
  const formulariosGuardados = useMemo(() => getPeritoFormulariosGuardados(), [version])
  const materiaisGuardados = useMemo(() => getPeritoMateriaisGuardados(), [version])
  const fotosGuardadas = useMemo(() => getPeritoFotosGuardadas(), [version])

  const selectedProcess = useMemo(() => {
    const all = [...pendingProcesses, ...completedProcesses, ...formulariosGuardados]
    return all.find((item) => item.id === selectedId) || null
  }, [pendingProcesses, completedProcesses, formulariosGuardados, selectedId])

  useEffect(() => {
    if (!selectedProcess) {
      setFormulario(null)
      setMateriais(emptyMateriaisForm())
      setFotos([])
      return
    }
    const perito = getLoggedUserName()
    setFormulario(
      selectedProcess.peritagemFormulario
        ? { ...selectedProcess.peritagemFormulario }
        : buildFormularioFromProcess(selectedProcess, perito),
    )
    if (selectedProcess.peritagemMateriais) {
      const m = selectedProcess.peritagemMateriais
      setMateriais({
        pecas: m.pecas || emptyMateriaisForm().pecas,
        descontoPecas: m.descontoPecas || '',
        maoObra: m.maoObra || emptyMateriaisForm().maoObra,
        descontoMaoObra: m.descontoMaoObra || '',
      })
    } else {
      setMateriais(emptyMateriaisForm())
    }
    setFotos(selectedProcess.peritagemFotos?.fotos || [])
  }, [selectedProcess])

  const selectProcess = (id) => {
    setSelectedId(id)
    setSearchParams({ id })
    setMessage('')
    setViewMode(null)
    setActiveTab('formulario')
  }

  const refresh = () => setVersion((v) => v + 1)

  const handleSaveFormulario = async () => {
    if (!selectedId || !formulario) return
    setSaving(true)
    const updated = savePeritagemFormulario(selectedId, formulario)
    setSaving(false)
    if (!updated) {
      setMessage('Não foi possível guardar o formulário.')
      return
    }
    refresh()
    setMessage(`Formulário guardado: ${updated.numeroSinistro}`)
  }

  const handleSaveMateriais = async (payload) => {
    if (!selectedId) return
    setSaving(true)
    const totals = calcMateriaisTotals(payload)
    const updated = savePeritagemMateriais(selectedId, { ...payload, ...totals })
    setSaving(false)
    if (!updated) {
      setMessage('Não foi possível guardar materiais.')
      return
    }
    refresh()
    setMessage(`Materiais guardados: ${updated.numeroSinistro}`)
  }

  const handleSaveFotos = async () => {
    if (!selectedId) return
    const filled = fotos.filter((f) => f.dataUrl).length
    if (filled < 6) {
      setMessage('Carregue as 6 fotos antes de guardar.')
      return
    }
    setSaving(true)
    const updated = savePeritagemFotos(selectedId, { fotos })
    setSaving(false)
    if (!updated) {
      setMessage('Não foi possível guardar as fotos.')
      return
    }
    refresh()
    setMessage(`Fotos guardadas: ${updated.numeroSinistro}`)
  }

  const handleEnviar = () => {
    if (!selectedId) return
    const updated = enviarPeritagemRelatorio(selectedId, getLocalDateTimeNow())
    if (!updated) {
      setMessage('Complete e guarde o formulário, materiais e as 6 fotos antes de enviar.')
      return
    }
    refresh()
    setSelectedId('')
    setSearchParams({})
    setMessage(`Relatório enviado ao Sinistro: ${updated.numeroSinistro}`)
  }

  const canSend = Boolean(
    selectedProcess?.peritagemFormulario &&
      selectedProcess?.peritagemMateriais &&
      (selectedProcess?.peritagemFotos?.fotos?.filter((f) => f.dataUrl)?.length || 0) >= 6 &&
      !selectedProcess?.peritagemEnviado,
  )

  const openEdit = (processId, tab) => {
    selectProcess(processId)
    setActiveTab(tab)
    setViewMode(null)
  }

  const confirmDelete = (label, onConfirm) => {
    if (window.confirm(`Tem a certeza que deseja eliminar ${label}?`)) onConfirm()
  }

  const notEnviado = (row) => !row.peritagemEnviado

  return (
    <div className="form-page users-page peritagem-page">
      <h1 className="dash-title">Peritagem Digital</h1>
      <p className="form-subtitle">
        Selecione o processo recebido, preencha o formulário, materiais, fotos e envie o relatório ao Sinistro.
      </p>

      <PeritagemDataTable
        title="Processos Pendentes de Peritagem"
        titleIcon={<FaClipboardList />}
        filterPlaceholder="Filtrar por sinistro, cliente ou matrícula..."
        emptyMessage="Sem solicitações pendentes."
        rows={pendingProcesses}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true },
          { key: 'cliente', label: 'Cliente', icon: <FaUserTie /> },
          {
            key: 'status',
            label: 'Estado',
            icon: <FaCheckCircle />,
            render: () => <span className="pill emandamento">Aguardando peritagem</span>,
          },
        ]}
        showView={false}
        showEdit={false}
        showDelete={false}
        showPrint={false}
        onCustomAction={(row) => selectProcess(row.id)}
        customActionLabel="Preencher formulário"
        customActionIcon={<FaPen />}
      />

      {selectedProcess && !selectedProcess.peritagemEnviado && (
        <div className="peritagem-workspace">
          <div className="peritagem-workspace__head">
            <div>
              <h3>{selectedProcess.numeroSinistro} — {selectedProcess.cliente}</h3>
              <p>Matrícula: {selectedProcess.matricula || '—'} | Apólice: {selectedProcess.numeroApolice || '—'}</p>
            </div>
            <div className="peritagem-steps">
              <span className={selectedProcess.peritagemFormulario ? 'done' : ''}>1. Formulário</span>
              <span className={selectedProcess.peritagemMateriais ? 'done' : ''}>2. Materiais</span>
              <span className={(selectedProcess.peritagemFotos?.fotos?.length || 0) >= 6 ? 'done' : ''}>3. Fotos</span>
            </div>
          </div>

          <div className="peritagem-tabs peritagem-tabs--cards">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`peritagem-tab-card ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => { setActiveTab(tab.id); setViewMode(null) }}
              >
                <span className="peritagem-tab-card__icon">{tab.icon}</span>
                <span className="peritagem-tab-card__text">
                  <strong>{tab.label}</strong>
                  <small>{tab.description}</small>
                </span>
              </button>
            ))}
          </div>

          {TABS.filter((t) => t.id === activeTab).map((tab) => (
            <div key={tab.id} className="peritagem-active-banner">
              <div className="peritagem-active-banner__icon">{tab.icon}</div>
              <div>
                <h3>{tab.label}</h3>
                <p>{tab.description}</p>
              </div>
            </div>
          ))}

          <div className="peritagem-panel">
            {activeTab === 'formulario' && formulario && (
              <PeritagemFormularioSection
                form={formulario}
                onChange={setFormulario}
                onSave={handleSaveFormulario}
                saving={saving}
                readOnly={viewMode === 'view'}
                hideHeader
              />
            )}
            {activeTab === 'materiais' && (
              <PeritagemMateriaisSection
                data={materiais}
                onChange={setMateriais}
                onSave={handleSaveMateriais}
                saving={saving}
                readOnly={viewMode === 'view'}
                hideHeader
              />
            )}
            {activeTab === 'fotos' && (
              <PeritagemFotosSection
                fotos={fotos}
                onChange={setFotos}
                onSave={handleSaveFotos}
                saving={saving}
                readOnly={viewMode === 'view'}
                hideHeader
              />
            )}
          </div>

          <div className="peritagem-send-bar">
            <button type="button" className="primary-btn form-btn" onClick={handleEnviar} disabled={!canSend}>
              <FaPaperPlane />
              Enviar relatório ao Sinistro
            </button>
            {!canSend && (
              <small>Guarde o formulário, materiais e as 6 fotos para activar o envio.</small>
            )}
          </div>
        </div>
      )}

      {message && <p className="form-message">{message}</p>}

      <PeritagemDataTable
        title="Formulários Guardados"
        titleIcon={<FaClipboardList />}
        filterPlaceholder="Filtrar formulários..."
        emptyMessage="Sem formulários guardados."
        rows={formulariosGuardados}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true },
          { key: 'cliente', label: 'Cliente', icon: <FaUserTie /> },
          {
            key: 'data',
            label: 'Data',
            icon: <FaCalendarAlt />,
            render: (row) => row.peritagemFormulario?.savedAt?.slice(0, 10) || '—',
          },
        ]}
        onView={(row) => { openEdit(row.id, 'formulario'); setViewMode('view') }}
        onEdit={(row) => openEdit(row.id, 'formulario')}
        onPrint={(row) => printPeritagemFormulario(row)}
        onDelete={(row) => confirmDelete(`o formulário ${row.numeroSinistro}`, () => {
          deletePeritagemFormulario(row.id)
          refresh()
          setMessage(`Formulário eliminado: ${row.numeroSinistro}`)
        })}
        canEdit={notEnviado}
        canDelete={notEnviado}
      />

      <PeritagemDataTable
        title="Materiais e Mão de Obra Guardados"
        titleIcon={<FaTools />}
        filterPlaceholder="Filtrar materiais..."
        emptyMessage="Sem materiais guardados."
        rows={materiaisGuardados}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true },
          {
            key: 'total',
            label: 'Total Geral',
            icon: <FaMoneyBillWave />,
            render: (row) => `${row.peritagemMateriais?.totalGeral || '—'} MTS`,
          },
          {
            key: 'data',
            label: 'Data',
            icon: <FaCalendarAlt />,
            render: (row) => row.peritagemMateriais?.savedAt?.slice(0, 10) || '—',
          },
        ]}
        onView={(row) => { openEdit(row.id, 'materiais'); setViewMode('view') }}
        onEdit={(row) => openEdit(row.id, 'materiais')}
        onPrint={(row) => printPeritagemMateriais(row)}
        onDelete={(row) => confirmDelete(`os materiais ${row.numeroSinistro}`, () => {
          deletePeritagemMateriais(row.id)
          refresh()
          setMessage(`Materiais eliminados: ${row.numeroSinistro}`)
        })}
        canEdit={notEnviado}
        canDelete={notEnviado}
      />

      <PeritagemDataTable
        title="Fotos Guardadas"
        titleIcon={<FaCamera />}
        filterPlaceholder="Filtrar fotos..."
        emptyMessage="Sem fotos guardadas."
        rows={fotosGuardadas}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true },
          {
            key: 'fotos',
            label: 'Fotos',
            icon: <FaImages />,
            render: (row) => `${row.peritagemFotos?.fotos?.length || 0} / ${PHOTO_SLOTS.length}`,
          },
          {
            key: 'data',
            label: 'Data',
            icon: <FaCalendarAlt />,
            render: (row) => row.peritagemFotos?.savedAt?.slice(0, 10) || '—',
          },
        ]}
        onView={(row) => { openEdit(row.id, 'fotos'); setViewMode('view') }}
        onEdit={(row) => openEdit(row.id, 'fotos')}
        onPrint={(row) => printPeritagemFotos(row)}
        onDelete={(row) => confirmDelete(`as fotos ${row.numeroSinistro}`, () => {
          deletePeritagemFotos(row.id)
          refresh()
          setMessage(`Fotos eliminadas: ${row.numeroSinistro}`)
        })}
        canEdit={notEnviado}
        canDelete={notEnviado}
      />

      <PeritagemDataTable
        title="Relatórios Enviados ao Sinistro"
        titleIcon={<FaPaperPlane />}
        filterPlaceholder="Filtrar relatórios enviados..."
        emptyMessage="Nenhum relatório enviado ainda."
        rows={completedProcesses}
        columns={[
          { key: 'numeroSinistro', label: 'Nº Sinistro', icon: <FaHashtag />, strong: true },
          { key: 'cliente', label: 'Cliente', icon: <FaUserTie /> },
          {
            key: 'enviado',
            label: 'Enviado em',
            icon: <FaCalendarAlt />,
            render: (row) => row.peritagemEnviadoData || row.peritagemData || '—',
          },
          {
            key: 'status',
            label: 'Status',
            icon: <FaCheckCircle />,
            render: () => (
              <span className="pill finalizado peritagem-status-pill">
                <FaCheckCircle /> Enviado
              </span>
            ),
          },
        ]}
        onView={(row) => { openEdit(row.id, 'formulario'); setViewMode('view') }}
        onPrint={(row) => printPeritagemRelatorioCompleto(row)}
        showEdit={false}
        showDelete={false}
      />
    </div>
  )
}
