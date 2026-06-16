import { getSession, roleLabel } from '../utils/auth'
import AdminDashboard from './AdminDashboard'
import PlaceholderPage from './PlaceholderPage'

export default function RoleDashboard() {
  const session = getSession()
  const role = session?.role

  if (['admin', 'sinistro', 'credit', 'contabilidade', 'juridico', 'callcenter', 'gestor', 'perito'].includes(role)) {
    return <AdminDashboard />
  }

  return (
    <PlaceholderPage
      title={`Dashboard ${roleLabel(role)}`}
      description="Área do utilizador."
    />
  )
}

