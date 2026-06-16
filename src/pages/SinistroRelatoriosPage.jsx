import { useMemo, useState } from 'react'
import { FaDownload, FaFilePdf, FaFilter, FaProjectDiagram, FaTable } from 'react-icons/fa'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { getHistory, getProcesses } from '../utils/processes'

const LETTERHEAD_URL = new URL('../../Papel Timbrado.png', import.meta.url).href
const REPORT_MARGIN = 18
const REPORT_TOP_CONTENT_Y = 88

function formatDate(value) {
  if (!value) return '--'
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return date.toLocaleDateString('pt-PT')
  } catch {
    return String(value)
  }
}

function getFluxoStage(item) {
  if (item.status === 'Finalizado') return 'Finalizado'
  if (item.status === 'Encerrado') return 'Encerrado'
  if (item.enviadoContabilidade) return 'Contabilidade'
  if (item.gestorAssinadoDocumento) return 'Assinado Gestor'
  if (item.enviadoGestor) return 'Aguardando Gestor'
  if (item.ordemReparacaoDocumento) return 'Ordem/Quitação'
  if (item.peritagemRelatorio) return 'Peritagem'
  if (item.premioPago === 'Sim') return 'Credit aprovado'
  return item.status || 'Iniciado'
}

export default function SinistroRelatoriosPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedId, setSelectedId] = useState('')
  const processes = useMemo(() => getProcesses(), [])
  const history = useMemo(() => getHistory(), [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return processes.filter((item) => {
      const textMatch = !q
        ? true
        : `${item.numeroSinistro} ${item.cliente} ${item.matricula} ${item.numeroApolice}`.toLowerCase().includes(q)
      const statusMatch = statusFilter === 'all' ? true : item.status === statusFilter
      return textMatch && statusMatch
    })
  }, [processes, query, statusFilter])

  const buildStageCounts = (list) => {
    const base = {
      Iniciado: 0,
      'Em andamento': 0,
      Finalizado: 0,
      Encerrado: 0,
    }
    list.forEach((item) => {
      const key = item.status || 'Iniciado'
      if (!base[key]) base[key] = 0
      base[key] += 1
    })
    return base
  }

  const stageCounts = useMemo(() => buildStageCounts(filtered), [filtered])

  const selectedProcess = useMemo(
    () => filtered.find((item) => item.id === selectedId) || null,
    [filtered, selectedId],
  )

  const drawHeaderAndLetterhead = async (doc, subtitle) => {
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    try {
      const img = await fetch(LETTERHEAD_URL).then((res) => res.blob())
      const reader = new FileReader()
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(img)
      })
      doc.addImage(dataUrl, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'MEDIUM')
    } catch {
      doc.setFillColor(236, 247, 240)
      doc.rect(0, 0, pageWidth, 34, 'F')
    }
    doc.setTextColor(25, 88, 56)
    doc.setFontSize(15)
    doc.text('Relatório de Processos - Sinistro', pageWidth / 2, 52, { align: 'center' })
    doc.setFontSize(10)
    doc.setTextColor(42, 102, 72)
    doc.text(subtitle, pageWidth / 2, 59, { align: 'center' })
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, pageWidth / 2, 65, { align: 'center' })
  }

  const generateGeneralReport = async (mode = 'all') => {
    const data =
      mode === 'finalizados'
        ? processes.filter((item) => item.status === 'Finalizado')
        : processes
    const counts = buildStageCounts(data)
    const doc = new jsPDF('p', 'mm', 'a4')
    await drawHeaderAndLetterhead(
      doc,
      mode === 'finalizados' ? 'Exportação: Processos Finalizados' : 'Exportação: Todos os estágios',
    )

    autoTable(doc, {
      startY: REPORT_TOP_CONTENT_Y,
      theme: 'grid',
      head: [['Indicador', 'Valor']],
      body: [
        ['Total de Processos', String(data.length)],
        ['Finalizados', String(counts.Finalizado || 0)],
        ['Encerrados', String(counts.Encerrado || 0)],
        ['Em andamento', String(counts['Em andamento'] || 0)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 102, 74], textColor: [255, 255, 255] },
      margin: { left: REPORT_MARGIN, right: REPORT_MARGIN },
      tableWidth: 90,
    })

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || REPORT_TOP_CONTENT_Y) + 8,
      theme: 'grid',
      head: [['Etapa do Fluxo', 'Descrição']],
      body: [
        ['Iniciado', 'Sinistro cria o processo e regista dados iniciais'],
        ['Em andamento', 'Peritagem, ordem/quitação e aprovação do gestor'],
        ['Assinado Gestor', 'Documento assinado digitalmente e devolvido ao Sinistro'],
        ['Contabilidade', 'Processo enviado para pagamento e comprovação'],
        ['Finalizado', 'Comprovativo anexado e pagamento concluído'],
      ],
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [30, 102, 74], textColor: [255, 255, 255] },
      margin: { left: REPORT_MARGIN, right: REPORT_MARGIN },
    })

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || REPORT_TOP_CONTENT_Y) + 8,
      theme: 'grid',
      head: [['Resumo por Estágio', 'Quantidade']],
      body: [
        ['Iniciado', String(counts.Iniciado || 0)],
        ['Em andamento', String(counts['Em andamento'] || 0)],
        ['Finalizado', String(counts.Finalizado || 0)],
        ['Encerrado', String(counts.Encerrado || 0)],
      ],
      styles: { fontSize: 8.5 },
      headStyles: { fillColor: [30, 102, 74], textColor: [255, 255, 255] },
      margin: { left: REPORT_MARGIN, right: REPORT_MARGIN },
      tableWidth: 100,
    })

    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || REPORT_TOP_CONTENT_Y) + 8,
      theme: 'striped',
      head: [['Nº Sinistro', 'Cliente', 'Apólice', 'Estágio', 'Status', 'Última Atualização']],
      body: data.map((item) => [
        item.numeroSinistro || '--',
        item.cliente || '--',
        item.numeroApolice || '--',
        getFluxoStage(item),
        item.status || '--',
        formatDate(item.updatedAt),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 102, 74], textColor: [255, 255, 255] },
      margin: { left: REPORT_MARGIN, right: REPORT_MARGIN },
    })

    doc.save(
      `relatorio-sinistro-${mode === 'finalizados' ? 'finalizados' : 'todos-estagios'}-${new Date().toISOString().slice(0, 10)}.pdf`,
    )
  }

  const generateProcessReport = async () => {
    if (!selectedProcess) return
    const doc = new jsPDF('p', 'mm', 'a4')
    await drawHeaderAndLetterhead(doc, `Exportação Individual: ${selectedProcess.numeroSinistro || 'Processo'}`)

    autoTable(doc, {
      startY: REPORT_TOP_CONTENT_Y,
      theme: 'grid',
      head: [['Campo', 'Detalhe']],
      body: [
        ['Nº Sinistro', selectedProcess.numeroSinistro || '--'],
        ['Cliente', selectedProcess.cliente || '--'],
        ['Apólice', selectedProcess.numeroApolice || '--'],
        ['Matrícula', selectedProcess.matricula || '--'],
        ['Status', selectedProcess.status || '--'],
        ['Estágio', getFluxoStage(selectedProcess)],
        ['Data Acidente', formatDate(selectedProcess.dataAcidente)],
        ['Data Notificação', formatDate(selectedProcess.dataNotificacao)],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [30, 102, 74], textColor: [255, 255, 255] },
      margin: { left: REPORT_MARGIN, right: REPORT_MARGIN },
    })

    const processHistory = history
      .filter((item) => item.processoId === selectedProcess.id)
      .slice(0, 20)
    autoTable(doc, {
      startY: (doc.lastAutoTable?.finalY || 90) + 8,
      theme: 'striped',
      head: [['Data', 'Ação', 'Utilizador']],
      body: processHistory.map((entry) => [
        formatDate(entry.data),
        entry.acao || '--',
        entry.usuario || '--',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 102, 74], textColor: [255, 255, 255] },
      margin: { left: REPORT_MARGIN, right: REPORT_MARGIN },
    })

    doc.save(`relatorio-${selectedProcess.numeroSinistro || 'processo'}.pdf`)
  }

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Relatórios Sinistro</h1>
      <p className="form-subtitle">
        Extraia relatórios PDF com papel timbrado, tabelas e diagramas dos processos em todos os estágios ou apenas finalizados.
      </p>

      <div className="users-filter-box" style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Pesquisar por nº sinistro, cliente, matrícula, apólice"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label className="field-group" style={{ maxWidth: '260px' }}>
          <FaFilter className="field-icon" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">Todos os estágios</option>
            <option value="Finalizado">Finalizados</option>
            <option value="Encerrado">Encerrados</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Iniciado">Iniciado</option>
          </select>
        </label>
      </div>

      <div className="action-buttons" style={{ marginBottom: '0.8rem' }}>
        <button type="button" className="btn-table" onClick={() => generateGeneralReport('all')}>
          <FaFilePdf /> Exportar PDF - Todos os estágios
        </button>
        <button type="button" className="btn-table" onClick={() => generateGeneralReport('finalizados')}>
          <FaFilePdf /> Exportar PDF - Finalizados
        </button>
        <button type="button" className="btn-table" onClick={generateProcessReport} disabled={!selectedProcess}>
          <FaDownload /> Gerar relatório do processo selecionado
        </button>
      </div>

      <div className="table users-table credit-premium-table sinistro-relatorios-table">
        <div className="tr th">
          <div><span className="juridico-th-label"><FaTable /> Nº Sinistro</span></div>
          <div><span className="juridico-th-label"><FaTable /> Cliente</span></div>
          <div><span className="juridico-th-label"><FaProjectDiagram /> Estágio</span></div>
          <div><span className="juridico-th-label"><FaFilePdf /> Status</span></div>
          <div><span className="juridico-th-label"><FaDownload /> Ações</span></div>
        </div>
        {filtered.map((item) => (
          <div key={item.id} className={`tr credit-row ${selectedId === item.id ? 'tr-selected' : ''}`}>
            <div className="td-strong credit-col">{item.numeroSinistro || '--'}</div>
            <div className="credit-col">{item.cliente || '--'}</div>
            <div className="credit-col">{getFluxoStage(item)}</div>
            <div className="credit-col">
              <span className={`pill ${String(item.status || 'Iniciado').toLowerCase().replace(' ', '')}`}>
                {item.status || 'Iniciado'}
              </span>
            </div>
            <div className="action-buttons">
              <button type="button" className="btn-table" onClick={() => setSelectedId(item.id)}>
                Selecionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
