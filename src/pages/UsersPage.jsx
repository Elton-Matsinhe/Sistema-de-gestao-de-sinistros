import { useEffect, useMemo, useState } from 'react'
import { FaAt, FaEdit, FaTag, FaTrashAlt, FaUser } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { getSession, getUsers, roleLabel, USERS_KEY } from '../utils/auth'

const PAGE_SIZE = 5

export default function UsersPage() {
  const navigate = useNavigate()
  const [filterMode, setFilterMode] = useState('categoria') // categoria | nome | email
  const [query, setQuery] = useState('')
  const [roleQuery, setRoleQuery] = useState('all')
  const [page, setPage] = useState(1)
  const [version, setVersion] = useState(0)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [closingModal, setClosingModal] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const session = getSession()

  useEffect(() => {
    if (!success) return
    const timeout = setTimeout(() => {
      setSuccess('')
    }, 3000)
    return () => clearTimeout(timeout)
  }, [success])

  const users = useMemo(() => getUsers(), [version])

  const filtered = useMemo(() => {
    if (filterMode === 'categoria') {
      if (roleQuery === 'all') return users
      return users.filter((u) => (u.role || '').toLowerCase() === roleQuery.toLowerCase())
    }
    const q = query.trim().toLowerCase()
    if (!q) return users
    if (filterMode === 'nome') return users.filter((u) => (u.name || '').toLowerCase().includes(q))
    return users.filter((u) => (u.email || '').toLowerCase().includes(q))
  }, [filterMode, query, roleQuery, users])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)

  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filtered.slice(start, start + PAGE_SIZE)
  }, [filtered, currentPage])

  const roleOptions = useMemo(() => {
    const unique = Array.from(new Set(users.map((u) => u.role).filter(Boolean)))
    return ['all', ...unique]
  }, [users])

  const handleDeleteRequest = (user) => {
    setError('')
    setSuccess('')
    if (user.id === session?.userId) {
      setError('Não é permitido excluir o utilizador logado.')
      return
    }
    setClosingModal(false)
    setPendingDelete(user)
  }

  const closeDeleteModal = () => {
    setClosingModal(true)
    setTimeout(() => {
      setPendingDelete(null)
      setClosingModal(false)
    }, 180)
  }

  const confirmDelete = () => {
    if (!pendingDelete) return
    const deletedName = pendingDelete.name
    const id = pendingDelete.id
    const updated = users.filter((u) => u.id !== id)
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
    closeDeleteModal()
    setError('')
    setSuccess(`Utilizador excluído com sucesso: ${deletedName}.`)
    setVersion((v) => v + 1)
  }

  const handleEdit = (id) => {
    navigate(`/Usuarios/Editar?id=${encodeURIComponent(id)}`)
  }

  return (
    <div className="form-page users-page">
      <h1 className="dash-title">Utilizadores</h1>
      <p className="form-subtitle">Gestão de utilizadores com filtros dinâmicos e paginação.</p>
      {error && <p className="form-message form-message--error">{error}</p>}
      {success && <p className="form-message form-message--fadeout">{success}</p>}

      <div className="filter-tabs">
        <button
          type="button"
          className={`tab-btn ${filterMode === 'categoria' ? 'active' : ''}`}
          onClick={() => setFilterMode('categoria')}
        >
          <FaTag />
          <span>Categoria</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${filterMode === 'nome' ? 'active' : ''}`}
          onClick={() => setFilterMode('nome')}
        >
          <FaUser />
          <span>Nome</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${filterMode === 'email' ? 'active' : ''}`}
          onClick={() => setFilterMode('email')}
        >
          <FaAt />
          <span>Email</span>
        </button>
      </div>

      <div className="users-filter-box">
        {filterMode === 'categoria' ? (
          <select value={roleQuery} onChange={(e) => { setRoleQuery(e.target.value); setPage(1) }}>
            {roleOptions.map((r) => (
              <option key={r} value={r}>
                {r === 'all' ? 'Todas categorias' : roleLabel(r)}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            placeholder={filterMode === 'nome' ? 'Pesquisar por nome' : 'Pesquisar por email'}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
          />
        )}
      </div>

      <div className="table users-table">
        <div className="tr th">
          <div>Nome</div>
          <div>Email</div>
          <div>Categoria</div>
          <div>Ações</div>
        </div>

        {paged.map((u) => (
          <div key={u.id} className="tr">
            <div className="td-strong">{u.name}</div>
            <div>{u.email}</div>
            <div>
              <span className="pill emandamento">{roleLabel(u.role)}</span>
            </div>
            <div className="action-buttons">
              <button type="button" className="btn-table icon-only" title="Editar" onClick={() => handleEdit(u.id)}>
                <FaEdit />
              </button>
              <button
                type="button"
                className="btn-table icon-only btn-danger"
                title="Excluir"
                onClick={() => handleDeleteRequest(u)}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}

        {paged.length === 0 && (
          <div className="tr">
            <div>Nenhum utilizador encontrado.</div>
            <div />
            <div />
            <div />
          </div>
        )}
      </div>

      <div className="users-pagination">
        <button type="button" className="btn-table" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
          Anterior
        </button>
        <span>Página {currentPage} de {totalPages}</span>
        <button type="button" className="btn-table" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
          Seguinte
        </button>
      </div>

      {pendingDelete && (
        <div className={`modal-backdrop ${closingModal ? 'closing' : ''}`}>
          <div className={`confirm-modal ${closingModal ? 'closing' : ''}`}>
            <h3>Tem certeza?</h3>
            <p>
              Deseja excluir o utilizador <strong>{pendingDelete.name}</strong>?
            </p>
            <div className="confirm-actions">
              <button type="button" className="btn-table" onClick={closeDeleteModal}>
                Cancelar
              </button>
              <button type="button" className="btn-table btn-danger" onClick={confirmDelete}>
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

