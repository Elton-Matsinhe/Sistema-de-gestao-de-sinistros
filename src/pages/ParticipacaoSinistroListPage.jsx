import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaCalendarAlt,
  FaCar,
  FaClipboardList,
  FaFileAlt,
  FaHashtag,
  FaListAlt,
  FaPlus,
  FaRegUser,
  FaTag,
} from 'react-icons/fa'
import ParticipacaoDataTable from '../components/participacao/ParticipacaoDataTable'
import {
  deleteParticipacao,
  getParticipacaoById,
  getParticipacaoSummary,
  getParticipacoes,
} from '../utils/participacoes'
import {
  downloadParticipacaoPdf,
  printParticipacaoPdf,
  shareParticipacaoPdf,
} from '../utils/participacaoPdf'

const STATUS_LABELS = {
  rascunho: 'Rascunho',
  submetida: 'Submetida',
}

export default function ParticipacaoSinistroListPage() {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const [feedback, setFeedback] = useState('')

  const rows = useMemo(() => {
    return getParticipacoes().map((p) => ({
      id: p.id,
      raw: p,
      ...getParticipacaoSummary(p),
    }))
  }, [version])

  const columns = [
    {
      key: 'numeroSinistro',
      label: 'Nº Sinistro',
      icon: <FaHashtag />,
      strong: true,
      render: (row) => row.numeroSinistro,
    },
    {
      key: 'cliente',
      label: 'Cliente / Segurado',
      icon: <FaRegUser />,
      render: (row) => row.cliente,
    },
    {
      key: 'matricula',
      label: 'Matrícula',
      icon: <FaCar />,
      render: (row) => row.matricula,
    },
    {
      key: 'tiposFormulario',
      label: 'Formulários',
      icon: <FaClipboardList />,
      render: (row) => row.tiposFormulario,
    },
    {
      key: 'status',
      label: 'Estado',
      icon: <FaTag />,
      render: (row) => (
        <span className={`participacao-status-pill participacao-status-pill--${row.status}`}>
          {STATUS_LABELS[row.status] || row.status}
        </span>
      ),
    },
    {
      key: 'criadoEm',
      label: 'Criado em',
      icon: <FaCalendarAlt />,
      render: (row) =>
        row.criadoEm ? new Date(row.criadoEm).toLocaleString('pt-PT') : '—',
    },
  ]

  const filterFields = [
    {
      key: 'status',
      label: 'Estado',
      render: (row) => row.status,
      options: ['rascunho', 'submetida'],
      optionLabels: { rascunho: 'Rascunho', submetida: 'Submetida' },
    },
  ]

  const refresh = () => setVersion((v) => v + 1)

  const loadParticipacao = (row) => {
    const fresh = getParticipacaoById(row.id)
    if (!fresh?.forms?.length) {
      throw new Error('Participação sem formulários guardados.')
    }
    return fresh
  }

  const handleEdit = (row) => {
    navigate(`/Sinistro/Participacao/Criar?id=${row.id}`)
  }

  const handleDelete = (row) => {
    if (
      !window.confirm(
        `Tem a certeza de que deseja eliminar a participação ${row.numeroSinistro}? Esta acção não pode ser revertida.`,
      )
    ) {
      return
    }
    deleteParticipacao(row.id)
    setFeedback('Participação eliminada com sucesso.')
    refresh()
  }

  const handlePrint = async (row) => {
    try {
      const participacao = loadParticipacao(row)
      await printParticipacaoPdf(participacao)
      setFeedback('PDF aberto para impressão.')
    } catch (err) {
      setFeedback(err?.message || 'Erro ao imprimir PDF.')
    }
  }

  const handleDownload = async (row) => {
    try {
      const participacao = loadParticipacao(row)
      await downloadParticipacaoPdf(participacao)
      setFeedback('PDF transferido com sucesso.')
    } catch (err) {
      setFeedback(err?.message || 'Erro ao gerar PDF.')
    }
  }

  const handleSend = async (row) => {
    try {
      const participacao = loadParticipacao(row)
      const shared = await shareParticipacaoPdf(participacao)
      setFeedback(
        shared
          ? 'PDF partilhado com sucesso.'
          : 'PDF transferido (partilha não disponível neste dispositivo).',
      )
    } catch (err) {
      setFeedback(err?.message || 'Erro ao enviar PDF.')
    }
  }

  return (
    <div className="form-page participacao-list-page">
      <div className="participacao-page-header">
        <div>
          <h1 className="dash-title">Listar Participações</h1>
          <p className="form-subtitle">
            Consulte, edite, imprima ou envie os formulários de participação de sinistro.
          </p>
        </div>
        <button
          type="button"
          className="primary-btn"
          onClick={() => navigate('/Sinistro/Participacao/Criar')}
        >
          <FaPlus /> Nova participação
        </button>
      </div>

      <ParticipacaoDataTable
        title="Participações de Sinistro"
        titleIcon={<FaListAlt />}
        columns={columns}
        rows={rows}
        filterFields={filterFields}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPrint={handlePrint}
        onDownload={handleDownload}
        onSend={handleSend}
      />

      {feedback && <p className="form-success">{feedback}</p>}
    </div>
  )
}
