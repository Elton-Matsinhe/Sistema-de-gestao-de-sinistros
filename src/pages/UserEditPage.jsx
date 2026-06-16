import { useEffect, useMemo, useState } from 'react'
import { FaAt, FaCamera, FaEye, FaEyeSlash, FaLock, FaSearch, FaTag, FaUser } from 'react-icons/fa'
import { getSession, getUsers, SESSION_KEY, USERS_KEY } from '../utils/auth'
import { useSearchParams } from 'react-router-dom'

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'sinistro', label: 'Sinistro (Departamento)' },
  { value: 'credit', label: 'Credit Control' },
  { value: 'contabilidade', label: 'Contabilidade' },
  { value: 'callcenter', label: 'Call Center' },
  { value: 'gestor', label: 'Gestor Técnico' },
  { value: 'juridico', label: 'Jurídico' },
]

function passwordStrength(password) {
  if (!password) return { level: 'none', label: '', pct: 0 }
  let score = 0
  if (password.length >= 8) score += 1
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1
  if (/\d/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1
  if (score <= 1) return { level: 'fraca', label: 'Fraca', pct: 33 }
  if (score === 2 || score === 3) return { level: 'media', label: 'Média', pct: 66 }
  return { level: 'forte', label: 'Forte', pct: 100 }
}

export default function UserEditPage() {
  const [searchParams] = useSearchParams()
  const [filterMode, setFilterMode] = useState('email') // email | nome | categoria
  const [query, setQuery] = useState('')
  const [roleQuery, setRoleQuery] = useState('sinistro')
  const [matches, setMatches] = useState([])
  const [user, setUser] = useState(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState('sinistro')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const userIdFromQuery = searchParams.get('id')
    if (!userIdFromQuery) return
    const users = getUsers()
    const found = users.find((u) => u.id === userIdFromQuery)
    if (found) {
      selectUser(found)
      setMatches([found])
    }
  }, [searchParams])

  const handleSearch = (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    const users = getUsers()

    const q = query.trim().toLowerCase()
    let found = []
    if (filterMode === 'email') {
      found = users.filter((u) => (u.email || '').toLowerCase() === q)
    } else if (filterMode === 'nome') {
      found = users.filter((u) => (u.name || '').toLowerCase().includes(q))
    } else {
      found = users.filter((u) => (u.role || '').toLowerCase() === roleQuery.toLowerCase())
    }

    setMatches(found)
    if (found.length === 0) {
      setUser(null)
      setError('Nenhum utilizador encontrado.')
      return
    }
    if (found.length === 1) {
      selectUser(found[0])
    } else {
      setUser(null)
    }
  }

  const selectUser = (u) => {
    setUser(u)
    setName(u.name || '')
    setEmail(u.email || '')
    setRole(u.role || 'sinistro')
    setAvatarUrl(u.avatarUrl || '')
    setPassword('')
    setConfirmPassword('')
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setAvatarUrl(result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = (event) => {
    event.preventDefault()
    if (!user) return
    setMessage('')
    setError('')

    if (password && password !== confirmPassword) {
      setError('A palavra-passe e a confirmação não coincidem.')
      return
    }

    const users = getUsers()
    const updated = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            name,
            email,
            password: password || u.password,
            role,
            avatarUrl,
          }
        : u,
    )
    localStorage.setItem(USERS_KEY, JSON.stringify(updated))

    const session = getSession()
    if (session?.userId === user.id) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ ...session, name, email, role, avatarUrl }),
      )
    }

    setMessage('Utilizador atualizado com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  const strength = useMemo(() => passwordStrength(password), [password])

  return (
    <div className="form-page">
      <h1 className="dash-title">Editar Utilizador</h1>
      <p className="form-subtitle">
        Filtre por categoria, nome ou email e atualize os dados do utilizador.
      </p>

      <div className="filter-tabs">
        <button
          type="button"
          className={`tab-btn ${filterMode === 'categoria' ? 'active' : ''}`}
          onClick={() => setFilterMode('categoria')}
        >
          <FaTag aria-hidden="true" />
          <span>Categoria</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${filterMode === 'nome' ? 'active' : ''}`}
          onClick={() => setFilterMode('nome')}
        >
          <FaUser aria-hidden="true" />
          <span>Nome</span>
        </button>
        <button
          type="button"
          className={`tab-btn ${filterMode === 'email' ? 'active' : ''}`}
          onClick={() => setFilterMode('email')}
        >
          <FaAt aria-hidden="true" />
          <span>Email</span>
        </button>
      </div>

      <form className="form-card form-card--wide" onSubmit={user ? handleSave : handleSearch}>
        {filterMode === 'categoria' ? (
          <label className="field-group select-group">
            <span className="field-label">Categoria</span>
            <select value={roleQuery} onChange={(event) => setRoleQuery(event.target.value)}>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className="field-group">
            <FaSearch className="field-icon" aria-hidden="true" />
            <input
              type={filterMode === 'email' ? 'email' : 'text'}
              placeholder={filterMode === 'email' ? 'Pesquisar por email' : 'Pesquisar por nome'}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              required
            />
          </label>
        )}

        <button type="submit" className="primary-btn form-btn">
          Procurar utilizador
        </button>

        {matches.length > 1 && (
          <div className="result-list">
            {matches.map((m) => (
              <button
                key={m.id}
                type="button"
                className="result-item"
                onClick={() => selectUser(m)}
              >
                <span className="result-name">{m.name}</span>
                <span className="result-meta">
                  {m.email} • {m.role}
                </span>
              </button>
            ))}
          </div>
        )}

        {user && (
          <>
            <div className="avatar-uploader">
              <div className="avatar-preview">
                {avatarUrl ? <img src={avatarUrl} alt="Foto do utilizador" /> : <FaUser aria-hidden="true" />}
              </div>
              <label className="btn-table avatar-btn">
                <FaCamera aria-hidden="true" />
                <span>Carregar imagem</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>

            <label className="field-group">
              <FaUser className="field-icon" aria-hidden="true" />
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>

            <label className="field-group">
              <FaAt className="field-icon" aria-hidden="true" />
              <input
                type="email"
                placeholder="Email institucional"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field-group select-group">
              <span className="field-label">Perfil de acesso</span>
              <select value={role} onChange={(event) => setRole(event.target.value)}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <FaLock className="field-icon" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Nova palavra-passe (opcional)"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                className="text-action"
                aria-label={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </label>

            <label className="field-group">
              <FaLock className="field-icon" aria-hidden="true" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirmar palavra-passe (opcional)"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <button
                type="button"
                className="text-action"
                aria-label={showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'}
                onClick={() => setShowConfirmPassword((current) => !current)}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </label>

            {password && (
              <div className={`strength strength--${strength.level}`}>
                <div className="strength-top">
                  <span>Força da senha</span>
                  <strong>{strength.label}</strong>
                </div>
                <div className="strength-bar">
                  <div className="strength-fill" style={{ width: `${strength.pct}%` }} />
                </div>
              </div>
            )}

            <button type="submit" className="primary-btn form-btn">
              Guardar alterações
            </button>
          </>
        )}

        {message && <p className="form-message">{message}</p>}
        {error && <p className="form-message form-message--error">{error}</p>}
      </form>
    </div>
  )
}

