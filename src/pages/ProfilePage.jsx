import { useEffect, useState } from 'react'
import { FaAt, FaCamera, FaLock, FaUser } from 'react-icons/fa'
import { getSession, getUsers, SESSION_KEY, USERS_KEY } from '../utils/auth'

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

export default function ProfilePage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const session = getSession()
    if (session) {
      setName(session.name || '')
      setEmail(session.email || '')
      setAvatarUrl(session.avatarUrl || '')
    }
  }, [])

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
    const session = getSession()
    if (!session) return

    const users = getUsers()
    const updated = users.map((u) =>
      u.id === session.userId
        ? {
            ...u,
            name,
            email,
            password: password || u.password,
            avatarUrl,
          }
        : u,
    )

    localStorage.setItem(USERS_KEY, JSON.stringify(updated))
    const newSession = {
      ...session,
      name,
      email,
      avatarUrl,
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
    setPassword('')
    setMessage('Perfil atualizado com sucesso.')
    setTimeout(() => setMessage(''), 2500)
  }

  const strength = passwordStrength(password)

  return (
    <div className="form-page">
      <h1 className="dash-title">Editar Perfil</h1>
      <p className="form-subtitle">Atualize os seus dados pessoais e credenciais de acesso.</p>

      <form className="form-card form-card--wide" onSubmit={handleSubmit}>
        <div className="avatar-uploader">
          <div className="avatar-preview">
            {avatarUrl ? <img src={avatarUrl} alt="Foto de perfil" /> : <FaUser aria-hidden="true" />}
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
            type="password"
            placeholder="Nova palavra-passe (opcional)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
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

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  )
}

