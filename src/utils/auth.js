export const ADMIN_KEY = 'sgs_admin_user'
export const SESSION_KEY = 'sgs_session'
export const USERS_KEY = 'sgs_users'

export function seedUsers() {
  const baseUsers = [
    {
      id: 'u_admin_1',
      name: 'Admin',
      email: 'admin@mz.com',
      password: 'Admin@123',
      role: 'admin',
      avatarUrl: '',
    },
    {
      id: 'u_credit_angelo_1',
      name: 'Angelo',
      email: 'angelo@credit.mz',
      password: 'Credit@123',
      role: 'credit',
      avatarUrl: '',
    },
    {
      id: 'u_perito_edmilson_1',
      name: 'Edmilson',
      email: 'edmilson@perito.mz',
      password: 'Perito@123',
      role: 'perito',
      avatarUrl: '',
    },
    {
      id: 'u_contab_ednise_1',
      name: 'Ednise',
      email: 'ednise@contabilidade.mz',
      password: 'Contab@123',
      role: 'contabilidade',
      avatarUrl: '',
    },
    {
      id: 'u_juridico_vania_1',
      name: 'Vania',
      email: 'vania@juridico.mz',
      password: 'Juridico@123',
      role: 'juridico',
      avatarUrl: '',
    },
    {
      id: 'u_callcenter_liria_1',
      name: 'Liria',
      email: 'liria@callcenter.mz',
      password: 'Call@123',
      role: 'callcenter',
      avatarUrl: '',
    },
    {
      id: 'u_gestor_tonderai_1',
      name: 'Tonderai',
      email: 'tonderai@gestor.mz',
      password: 'Gestor@123',
      role: 'gestor',
      avatarUrl: '',
    },
  ]

  const existingUsers = getUsers()
  const mergedUsers = [...existingUsers]
  baseUsers.forEach((baseUser) => {
    const indexById = mergedUsers.findIndex((user) => user.id === baseUser.id)
    if (indexById >= 0) {
      mergedUsers[indexById] = { ...mergedUsers[indexById], ...baseUser }
      return
    }
    const indexByEmail = mergedUsers.findIndex((user) => user.email === baseUser.email)
    if (indexByEmail >= 0) {
      mergedUsers[indexByEmail] = { ...mergedUsers[indexByEmail], ...baseUser }
      return
    }
    if (baseUser.role === 'gestor') {
      const legacyGestorIndex = mergedUsers.findIndex((user) => user.role === 'gestor')
      if (legacyGestorIndex >= 0) {
        mergedUsers[legacyGestorIndex] = { ...mergedUsers[legacyGestorIndex], ...baseUser }
        return
      }
    }
    mergedUsers.push(baseUser)
  })
  localStorage.setItem(USERS_KEY, JSON.stringify(mergedUsers))
  localStorage.setItem(ADMIN_KEY, JSON.stringify(baseUsers[0]))
}

export function getUsers() {
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) || []
  } catch {
    return []
  }
}

export function getSession() {
  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function loginLocal({ email, password }) {
  const users = getUsers()
  const normalizedEmail = email.trim().toLowerCase()
  const user = users.find((u) => (u.email || '').toLowerCase() === normalizedEmail)
  if (!user) return { ok: false, error: 'Credenciais inválidas.' }
  if (user.password !== password) return { ok: false, error: 'Credenciais inválidas.' }

  const session = {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatarUrl: user.avatarUrl || '',
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true, session }
}

export function roleLabel(role) {
  switch (role) {
    case 'admin':
      return 'Administrador'
    case 'sinistro':
      return 'Sinistro (Departamento)'
    case 'gestor':
      return 'Gestor Técnico'
    case 'callcenter':
      return 'Call Center'
    case 'credit':
      return 'Credit Control'
    case 'contabilidade':
      return 'Contabilidade'
    case 'juridico':
      return 'Jurídico'
    case 'perito':
      return 'Perito'
    default:
      return 'Utilizador'
  }
}

