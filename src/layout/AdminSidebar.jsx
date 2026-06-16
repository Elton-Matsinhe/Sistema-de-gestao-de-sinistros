import { NavLink, useLocation } from 'react-router-dom'
import {
  FaProjectDiagram,
  FaBalanceScale,
  FaBell,
  FaChartBar,
  FaCogs,
  FaClipboardCheck,
  FaFileAlt,
  FaHandHoldingUsd,
  FaTachometerAlt,
  FaUpload,
  FaUsers,
  FaListAlt,
  FaUserCheck,
} from 'react-icons/fa'

function SidebarItem({ to, icon, label, collapsed, isActive }) {
  return (
    <NavLink
      to={to}
      className={`side-item ${isActive ? 'active' : ''}`}
      title={collapsed ? label : undefined}
    >
      <span className="side-icon">{icon}</span>
      <span className="side-label">{label}</span>
    </NavLink>
  )
}

export default function AdminSidebar({ collapsed, session }) {
  const location = useLocation()
  const role = session?.role

  const items = (() => {
    if (role === 'admin') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Processos', icon: <FaFileAlt />, label: 'Processos' },
        { to: '/Usuarios', icon: <FaUsers />, label: 'Utilizadores' },
        { to: '/Relatorios', icon: <FaChartBar />, label: 'Relatórios' },
        { to: '/Alertas', icon: <FaBell />, label: 'Alertas' },
        { to: '/Configuracoes', icon: <FaCogs />, label: 'Configurações' },
      ]
    }

    if (role === 'sinistro') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Sinistro/Criar', icon: <FaFileAlt />, label: 'Criar Processo' },
        { to: '/Sinistro/Editar', icon: <FaClipboardCheck />, label: 'Editar Processo' },
        { to: '/Sinistro/Listar', icon: <FaListAlt />, label: 'Listar Processo' },
        { to: '/Sinistro/Fluxo', icon: <FaProjectDiagram />, label: 'Gerir Fluxo' },
        { to: '/Sinistro/Ordem', icon: <FaFileAlt />, label: 'Ordem/Quitação' },
        { to: '/Relatorios', icon: <FaChartBar />, label: 'Relatórios' },
      ]
    }

    if (role === 'credit') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Pendencias', icon: <FaHandHoldingUsd />, label: 'Pendências' },
        { to: '/Credit/Processos', icon: <FaFileAlt />, label: 'Processos' },
      ]
    }

    if (role === 'contabilidade') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Comprovativos', icon: <FaUpload />, label: 'Pendentes Pagamento' },
        { to: '/Contabilidade/Pagos', icon: <FaFileAlt />, label: 'Processos Pagos' },
      ]
    }

    if (role === 'juridico') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Cartas', icon: <FaBalanceScale />, label: 'Cartas' },
        { to: '/Processos', icon: <FaFileAlt />, label: 'Processos' },
      ]
    }

    if (role === 'callcenter') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Consulta', icon: <FaClipboardCheck />, label: 'Consulta' },
      ]
    }

    if (role === 'gestor') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Gestor/Assinaturas', icon: <FaFileAlt />, label: 'Assinaturas' },
        { to: '/Gestor/Assinados', icon: <FaClipboardCheck />, label: 'Documentos Assinados' },
      ]
    }

    if (role === 'perito') {
      return [
        { to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
        { to: '/Perito/Recebidos', icon: <FaUserCheck />, label: 'Processos Recebidos' },
        { to: '/Perito/Upload', icon: <FaUpload />, label: 'Peritagem Digital' },
      ]
    }

    return [{ to: '/Dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' }]
  })()

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {!collapsed && (
        <div className="side-brand">
          <img src="/imagens/icon1.png" alt="Imperial Seguros" className="side-logo" />
        </div>
      )}
      {!collapsed && <div className="side-divider" />}

      <nav className="side-nav">
        {items.map((it) => (
          <SidebarItem
            key={it.to}
            to={it.to}
            icon={it.icon}
            label={it.label}
            collapsed={collapsed}
            isActive={location.pathname === it.to}
          />
        ))}
      </nav>
      <div className="side-version">
        {!collapsed && <span className="side-version-label">Versão do Sistema</span>}
        <button type="button" className="side-version-pill">
          v1.0.0
        </button>
      </div>
    </aside>
  )
}

