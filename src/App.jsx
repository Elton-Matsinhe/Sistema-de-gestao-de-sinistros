import { useEffect, useMemo, useState } from 'react'
import {
  FaEye,
  FaEyeSlash,
  FaHeadset,
  FaLock,
  FaSignInAlt,
  FaUser,
} from 'react-icons/fa'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import AdminLayout from './layout/AdminLayout'
import PlaceholderPage from './pages/PlaceholderPage'
import ProfilePage from './pages/ProfilePage'
import UserCreatePage from './pages/UserCreatePage'
import UserEditPage from './pages/UserEditPage'
import UsersPage from './pages/UsersPage'
import RoleDashboard from './pages/RoleDashboard'
import SinistroCreatePage from './pages/SinistroCreatePage'
import SinistroEditPage from './pages/SinistroEditPage'
import SinistroFlowPage from './pages/SinistroFlowPage'
import SinistroListPage from './pages/SinistroListPage'
import SinistroOrdemPage from './pages/SinistroOrdemPage'
import CreditPendenciasPage from './pages/CreditPendenciasPage'
import CreditProcessosPage from './pages/CreditProcessosPage'
import PeritoRecebidosPage from './pages/PeritoRecebidosPage'
import PeritoUploadPage from './pages/PeritoUploadPage'
import ContabilidadePendentesPage from './pages/ContabilidadePendentesPage'
import ContabilidadePagosPage from './pages/ContabilidadePagosPage'
import JuridicoCartasPage from './pages/JuridicoCartasPage'
import JuridicoProcessosPage from './pages/JuridicoProcessosPage'
import CallCenterConsultaPage from './pages/CallCenterConsultaPage'
import GestorAssinaturasPage from './pages/GestorAssinaturasPage'
import GestorDocumentosAssinadosPage from './pages/GestorDocumentosAssinadosPage'
import SinistroRelatoriosPage from './pages/SinistroRelatoriosPage'
import ParticipacaoSinistroCreatePage from './pages/ParticipacaoSinistroCreatePage'
import ParticipacaoSinistroListPage from './pages/ParticipacaoSinistroListPage'
import { getSession, loginLocal, seedUsers } from './utils/auth'

function LoginView() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [typedTitle, setTypedTitle] = useState('')
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const phrases = useMemo(
    () => [
      'Fluxo de Sinistros',
      'Controle Entre Departamentos',
      'Triagem Interna Ágil',
      'Rota de Processos',
      'Resposta Interdepartamental',
    ],
    [],
  )
  const title = phrases[phraseIndex]

  useEffect(() => {
    seedUsers()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          const nextText = title.slice(0, typedTitle.length + 1)
          setTypedTitle(nextText)
          if (nextText.length === title.length) {
            setIsDeleting(true)
          }
          return
        }

        const nextText = title.slice(0, Math.max(typedTitle.length - 1, 0))
        setTypedTitle(nextText)
        if (nextText.length === 0) {
          setPhraseIndex((current) => (current + 1) % phrases.length)
          setIsDeleting(false)
        }
      },
      isDeleting ? 70 : 140,
    )

    return () => clearTimeout(timeout)
  }, [isDeleting, phrases.length, title, typedTitle])

  const handleLogin = (event) => {
    event.preventDefault()
    setError('')
    const result = loginLocal({ email, password })
    if (!result.ok) {
      setError(result.error)
      return
    }
    navigate('/Dashboard')
  }

  const whatsappMessage = encodeURIComponent(
    'Olá! Preciso de suporte no sistema de Gestão de Sinistro.',
  )
  const whatsappUrl = `https://wa.me/258841644096?text=${whatsappMessage}`

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="floating-effects" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="login-content">
          <img className="login-logo" src="/imagens/logo.png" alt="Logotipo Gestão de Sinistro" />
          <h1 className="login-title">
            {typedTitle}
            <span className="typing-caret" />
          </h1>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="field-group">
              <FaUser className="field-icon" aria-hidden="true" />
              <input
                type="email"
                placeholder="Email Institucional"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>

            <label className="field-group">
              <FaLock className="field-icon" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Palavra-passe"
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

            <button type="submit" className="primary-btn">
              <FaSignInAlt aria-hidden="true" />
              Entrar no sistema
            </button>

            <a className="support-link" href={whatsappUrl} target="_blank" rel="noreferrer">
              <FaHeadset aria-hidden="true" />
              Solicitar suporte
            </a>

            <div className="support-divider" />
            <p className="login-copy">Copyright @ 2026 . Todos direitos reservados</p>
            {error && <p className="login-error">{error}</p>}
          </form>
        </div>
      </section>

      <section className="map-panel">
        <iframe
          title="Mapa em tempo real"
          src="https://www.google.com/maps/embed?pb=!3m2!1spt-PT!2smz!4v1776336299912!5m2!1spt-PT!2smz!6m8!1m7!1sCAoSF0NJSE0wb2dLRUlDQWdJRFZ4cW5LcHdF!2m2!1d-25.95650172945236!2d32.59546450354173!3f139.0806933749684!4f7.099559736303192!5f0.7820865974627469"
          className="map-frame"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </main>
  )
}

function RequireAuth({ children }) {
  const session = getSession()
  if (!session) {
    return <Navigate to="/Login" replace />
  }
  return children
}

function RouteTitleSync() {
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === '/Login') {
      document.title = 'Login | Gestão de Sinistro'
      return
    }
    if (location.pathname === '/Dashboard') {
      document.title = 'Dashboard | Gestão de Sinistro'
      return
    }
    document.title = 'Gestão de Sinistro'
  }, [location.pathname])

  return null
}

function App() {
  const session = getSession()

  return (
    <>
      <RouteTitleSync />
      <Routes>
        <Route path="/" element={<Navigate to="/Login" replace />} />
        <Route path="/Login" element={<LoginView />} />
        <Route element={<RequireAuth>{session ? <AdminLayout session={session} /> : null}</RequireAuth>}>
          <Route path="/Dashboard" element={<RoleDashboard />} />
          <Route
            path="/Processos"
            element={
              session?.role === 'juridico'
                ? <JuridicoProcessosPage />
                : <PlaceholderPage title="Processos" description="Lista e gestão do fluxo de sinistros." />
            }
          />
          <Route path="/Sinistro/Criar" element={<SinistroCreatePage />} />
          <Route path="/Sinistro/Editar" element={<SinistroEditPage />} />
          <Route path="/Sinistro/Listar" element={<SinistroListPage />} />
          <Route path="/Sinistro/Fluxo" element={<SinistroFlowPage />} />
          <Route path="/Sinistro/Ordem" element={<SinistroOrdemPage />} />
          <Route path="/Sinistro/Participacao/Criar" element={<ParticipacaoSinistroCreatePage />} />
          <Route path="/Sinistro/Participacao/Listar" element={<ParticipacaoSinistroListPage />} />
          <Route path="/Gestor/Assinaturas" element={<GestorAssinaturasPage />} />
          <Route path="/Gestor/Assinados" element={<GestorDocumentosAssinadosPage />} />
          <Route
            path="/Usuarios"
            element={<UsersPage />}
          />
          <Route path="/Perfil" element={<ProfilePage />} />
          <Route path="/Usuarios/Criar" element={<UserCreatePage />} />
          <Route path="/Usuarios/Editar" element={<UserEditPage />} />
          <Route
            path="/Aprovacoes"
            element={<PlaceholderPage title="Aprovações" description="Aprovar ou rejeitar pagamentos." />}
          />
          <Route
            path="/Comprovativos"
            element={<ContabilidadePendentesPage />}
          />
          <Route path="/Contabilidade/Pagos" element={<ContabilidadePagosPage />} />
          <Route
            path="/Cartas"
            element={<JuridicoCartasPage />}
          />
          <Route
            path="/Consulta"
            element={<CallCenterConsultaPage />}
          />
          <Route
            path="/Pendencias"
            element={<CreditPendenciasPage />}
          />
          <Route path="/Credit/Processos" element={<CreditProcessosPage />} />
          <Route path="/Perito/Recebidos" element={<PeritoRecebidosPage />} />
          <Route path="/Perito/Upload" element={<PeritoUploadPage />} />
          <Route
            path="/Relatorios"
            element={
              session?.role === 'sinistro' || session?.role === 'admin'
                ? <SinistroRelatoriosPage />
                : <PlaceholderPage title="Relatórios" description="Relatórios e indicadores do sistema." />
            }
          />
          <Route path="/Alertas" element={<PlaceholderPage title="Alertas" description="Alertas e pendências." />} />
          <Route
            path="/Configuracoes"
            element={<PlaceholderPage title="Configurações" description="Configurações do sistema." />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/Login" replace />} />
      </Routes>
    </>
  )
}

export default App
