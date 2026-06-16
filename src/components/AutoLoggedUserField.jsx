import { FaUserTie } from 'react-icons/fa'
import { getSession } from '../utils/auth'

export default function AutoLoggedUserField({ label = 'Responsável' }) {
  const session = getSession()
  const nome = session?.name || session?.email || 'Utilizador'

  return (
    <div className="auto-user-card field-full">
      <div className="auto-user-card__icon">
        <FaUserTie />
      </div>
      <div className="auto-user-card__body">
        <span className="auto-user-card__label">{label}</span>
        <strong className="auto-user-card__value">{nome}</strong>
      </div>
    </div>
  )
}

export function getLoggedUserName() {
  const session = getSession()
  return session?.name || session?.email || 'Utilizador'
}
