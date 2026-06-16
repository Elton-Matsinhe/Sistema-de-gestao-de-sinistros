import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { FaArrowDown, FaArrowUp, FaEye, FaPaperPlane, FaPrint } from 'react-icons/fa'
import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'

const STATUS_COLORS = {
  Iniciado: '#f6c343',
  'Em andamento': '#2f80ed',
  Finalizado: '#27ae60',
  Encerrado: '#eb5757',
}

export default function AdminDashboard() {
  const stats = useMemo(
    () => [
      { label: 'Processos', value: 128, hint: 'Total registado', trend: { dir: 'up', pct: 8 } },
      { label: 'Iniciado', value: 18, hint: 'Novos', trend: { dir: 'up', pct: 3 } },
      { label: 'Em andamento', value: 67, hint: 'Em fluxo', trend: { dir: 'down', pct: 2 } },
      { label: 'Finalizado', value: 31, hint: 'Concluídos', trend: { dir: 'up', pct: 5 } },
      { label: 'Encerrados', value: 12, hint: 'Encerrados', trend: { dir: 'down', pct: 1 } },
    ],
    [],
  )

  const byStatus = useMemo(
    () => [
      { name: 'Iniciado', value: 18 },
      { name: 'Em andamento', value: 67 },
      { name: 'Finalizado', value: 31 },
      { name: 'Encerrado', value: 12 },
    ],
    [],
  )

  const monthly = useMemo(
    () => [
      { m: 'Jan', iniciados: 11, finalizados: 6 },
      { m: 'Fev', iniciados: 14, finalizados: 8 },
      { m: 'Mar', iniciados: 18, finalizados: 11 },
      { m: 'Abr', iniciados: 21, finalizados: 15 },
      { m: 'Mai', iniciados: 17, finalizados: 14 },
      { m: 'Jun', iniciados: 19, finalizados: 16 },
    ],
    [],
  )

  const flowNodes = useMemo(
    () => [
      { id: 'n1', position: { x: 0, y: 0 }, data: { label: 'Criação (Sinistro)' }, type: 'input' },
      { id: 'n2', position: { x: 220, y: 0 }, data: { label: 'Credit Control' } },
      { id: 'n3', position: { x: 440, y: -70 }, data: { label: 'Peritagem' } },
      { id: 'n4', position: { x: 660, y: -70 }, data: { label: 'Ordem / Quitação' } },
      { id: 'n5', position: { x: 880, y: -70 }, data: { label: 'Facturação' } },
      { id: 'n6', position: { x: 1100, y: -70 }, data: { label: 'Aprovação (Gestor)' } },
      { id: 'n7', position: { x: 1320, y: -70 }, data: { label: 'Contabilidade (Upload)' }, type: 'output' },
      { id: 'n8', position: { x: 440, y: 85 }, data: { label: 'Jurídico (extra)' } },
    ],
    [],
  )

  const flowEdges = useMemo(
    () => [
      { id: 'e1-2', source: 'n1', target: 'n2', animated: true },
      { id: 'e2-3', source: 'n2', target: 'n3', animated: true },
      { id: 'e3-4', source: 'n3', target: 'n4' },
      { id: 'e4-5', source: 'n4', target: 'n5' },
      { id: 'e5-6', source: 'n5', target: 'n6' },
      { id: 'e6-7', source: 'n6', target: 'n7', animated: true },
      { id: 'e2-8', source: 'n2', target: 'n8', label: 'não pago / repúdio' },
    ],
    [],
  )

  const tableRows = useMemo(
    () => [
      { numero: 'SN-2026-001', cliente: 'João M.', matricula: 'ABCD-12', status: 'Iniciado' },
      { numero: 'SN-2026-014', cliente: 'Carla N.', matricula: 'MZ-772', status: 'Em andamento' },
      { numero: 'SN-2026-021', cliente: 'Paulo S.', matricula: 'XPT-04', status: 'Finalizado' },
      { numero: 'SN-2026-028', cliente: 'Sara P.', matricula: 'TTR-90', status: 'Encerrado' },
    ],
    [],
  )

  return (
    <div className="dash">
      <div className="dash-top">
        <h1 className="dash-title">Dashboard</h1>
        <p>Visão global do ciclo de sinistros e pendências internas.</p>
      </div>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">
              <span>{s.label}</span>
              <span className={`trend ${s.trend.dir}`}>
                {s.trend.dir === 'up' ? <FaArrowUp /> : <FaArrowDown />}
                {s.trend.pct}%
              </span>
            </div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-hint">{s.hint}</div>
          </div>
        ))}
      </div>

      <div className="dash-grid">
        <div className="panel">
          <div className="panel-title">Processos por mês</div>
          <div className="panel-body chart">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="m" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="iniciados" fill="#2f80ed" radius={[6, 6, 0, 0]} />
                <Bar dataKey="finalizados" fill="#27ae60" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Distribuição por status</div>
          <div className="panel-body chart">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Tooltip />
                <Pie data={byStatus} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>
                  {byStatus.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#999'} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel span-2">
          <div className="panel-title">Fluxo do processo</div>
          <div className="panel-body flow">
            <ReactFlow nodes={flowNodes} edges={flowEdges} fitView proOptions={{ hideAttribution: true }}>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>

        <div className="panel span-2">
          <div className="panel-title">Últimos processos</div>
          <div className="panel-body">
            <div className="table">
              <div className="tr th">
                <div># Sinistro</div>
                <div>Cliente</div>
                <div>Matrícula</div>
                <div>Status</div>
                <div>Ação</div>
              </div>
              {tableRows.map((r) => (
                <div key={r.numero} className="tr">
                  <div className="td-strong">{r.numero}</div>
                  <div>{r.cliente}</div>
                  <div>{r.matricula}</div>
                  <div>
                    <span className={`pill ${r.status.replace(/\s/g, '').toLowerCase()}`}>{r.status}</span>
                  </div>
                  <div className="action-buttons">
                    <button type="button" className="btn-table icon-only" title="Ver detalhes">
                      <FaEye aria-hidden="true" />
                    </button>
                    <button type="button" className="btn-table icon-only" title="Imprimir">
                      <FaPrint aria-hidden="true" />
                    </button>
                    <button type="button" className="btn-table icon-only" title="Enviar">
                      <FaPaperPlane aria-hidden="true" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

