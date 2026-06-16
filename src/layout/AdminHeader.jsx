import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  FaBars,
  FaBell,
  FaChevronDown,
  FaClipboardList,
  FaCog,
  FaEdit,
  FaPlus,
  FaSignOutAlt,
  FaUserCircle,
  FaUsers,
} from 'react-icons/fa'
import { clearSession, roleLabel } from '../utils/auth'

function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}:${seconds}`,
  }
}

function greeting(date) {
  const h = date.getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function AdminHeader({ session, onToggleSidebar, notifications }) {
  const navigate = useNavigate()
  const [now, setNow] = useState(() => new Date())
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const notifRef = useRef(null)
  const userRef = useRef(null)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onDoc = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) setNotifOpen(false)
      if (userRef.current && !userRef.current.contains(event.target)) setUserOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const dateTime = useMemo(() => formatDateTime(now), [now])
  const greetingText = useMemo(() => greeting(now), [now])
  const badgeCount = notifications.filter((n) => n.status === 'pendente').length
  const isAdmin = session?.role === 'admin'
  const hasUnread = badgeCount > 0 && !notifOpen

  const handleLogout = () => {
    clearSession()
    navigate('/Login')
  }

  return (
    <header className="admin-header">
      <div className="header-left">
        <button type="button" className="icon-btn" onClick={onToggleSidebar} aria-label="Menu">
          <FaBars />
        </button>
        <div className="greeting">
          <div className="greeting-main">
            {greetingText}, <strong>{session?.name || 'Utilizador'}</strong>
          </div>
          <div className="greeting-sub">
            {dateTime.date} • {dateTime.time}
          </div>
        </div>
      </div>

      <div className="header-center" ref={notifRef}>
        <button
          type="button"
          className={`icon-btn notif-btn ${hasUnread ? 'has-unread' : ''}`}
          onClick={() => setNotifOpen((v) => !v)}
          aria-label="Notificações"
        >
          <FaBell />
          {badgeCount > 0 && <span className="badge">{badgeCount}</span>}
        </button>

        {notifOpen && (
          <div className="dropdown">
            <div className="dropdown-title">
              <FaClipboardList />
              <span>Notificações</span>
            </div>
            <div className="dropdown-list">
              {notifications.map((n) => (
                <button key={n.id} type="button" className="dropdown-item">
                  <div className={`dot ${n.status}`} />
                  <div className="dropdown-item-text">
                    <strong>{n.title}</strong>
                    <small>{n.meta}</small>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="header-right" ref={userRef}>
        <button
          type="button"
          className="user-pill"
          onClick={() => setUserOpen((v) => !v)}
          aria-label="Menu do utilizador"
        >
          <span className="avatar">
            {session?.avatarUrl ? (
              <img src={session.avatarUrl} alt={session?.name || 'Perfil'} />
            ) : (
              <FaUserCircle />
            )}
          </span>
          <span className="user-meta">
            <strong>{session?.name || 'Utilizador'}</strong>
            <small>{roleLabel(session?.role)}</small>
          </span>
          <FaChevronDown className={`chev ${userOpen ? 'open' : ''}`} />
        </button>

        {userOpen && (
          <div className="dropdown dropdown-right">
            <NavLink className="dropdown-item link" to="/Dashboard">
              <FaCog />
              Painel
            </NavLink>
            <NavLink className="dropdown-item link" to="/Perfil">
              <FaEdit />
              Editar Perfil
            </NavLink>
            {isAdmin && (
              <>
                <NavLink className="dropdown-item link" to="/Usuarios/Criar">
                  <FaPlus />
                  Criar Utilizador
                </NavLink>
                <NavLink className="dropdown-item link" to="/Usuarios/Editar">
                  <FaUsers />
                  Editar Utilizador
                </NavLink>
              </>
            )}
            <button type="button" className="dropdown-item danger" onClick={handleLogout}>
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

