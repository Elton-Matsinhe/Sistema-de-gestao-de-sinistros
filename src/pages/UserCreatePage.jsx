import { useMemo, useState } from 'react'
import { FaAt, FaCamera, FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa'
import { getUsers, USERS_KEY } from '../utils/auth'

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

export default function UserCreatePage() {
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

  const strength = useMemo(() => passwordStrength(password), [password])

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

  const handleSubmit = (event) => {
    event.preventDefault()
    setMessage('')
    setError('')

    const users = getUsers()
    const exists = users.some((u) => (u.email || '').toLowerCase() === email.trim().toLowerCase())
    if (exists) {
      setError('Já existe um utilizador com este email.')
      return
    }

    if (password !== confirmPassword) {
      setError('A palavra-passe e a confirmação não coincidem.')
      return
    }

    const newUser = {
      id: `u_${Date.now()}`,
      name,
      email,
      password,
      role,
      avatarUrl,
    }

    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    setMessage('Utilizador criado com sucesso.')
    setName('')
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setRole('sinistro')
    setAvatarUrl('')
    setTimeout(() => setMessage(''), 2500)
  }

  return (
    <div className="form-page">
      <h1 className="dash-title">Criar Utilizador</h1>
      <p className="form-subtitle">Defina os dados de acesso e o perfil de atuação no sistema.</p>

      <form className="form-card form-card--wide" onSubmit={handleSubmit}>
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

        <label className="field-group">
          <FaLock className="field-icon" aria-hidden="true" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Palavra-passe temporária"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
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
            placeholder="Confirmar palavra-passe"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
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

        <button type="submit" className="primary-btn form-btn">
          Criar utilizador
        </button>

        {message && <p className="form-message">{message}</p>}
        {error && <p className="form-message form-message--error">{error}</p>}
      </form>
    </div>
  )
}

