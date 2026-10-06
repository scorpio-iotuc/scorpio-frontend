
import { AppProvider } from './AppContext'
import LandingPage from '../pages/LandingPage/LandingPage'
import Login from '../pages/Login/Login'
import SignUp from '../pages/SignUp/SignUp'
import Dashboard from '../pages/Dashboard/Dashboard'
import AuthCard from '../components/AuthCard/AuthCard'
import { useSignupMode } from '../hooks/useSignupMode'
import '../pages/Login/Login.css'


function SignupDisabled() {
  return (
    <main className="auth-page auth-page--signup">
      <div className="auth-page__background" aria-hidden="true">
        <span className="auth-page__satellite-path" />
      </div>

      <AuthCard>
        <p className="auth-form__message auth-form__message--info" role="status">
          El registro esta deshabilitado. Contacta a un administrador.
        </p>
        <a className="auth-form__button auth-form__button--secondary" href="/login">
          Ir a login
        </a>
      </AuthCard>
    </main>
  )
}

function App() {
  const path = window.location.pathname
  const { signupMode, loading: signupModeLoading } = useSignupMode()

  function renderPage() {
    if (path === '/login') {
      return <Login />
    }

    if (path === '/signup') {
      if (signupModeLoading) {
        return null
      }

      if (signupMode !== 'public') {
        return <SignupDisabled />
      }

      return <SignUp />
    }

    if (path === '/dashboard') {
      return <Dashboard />
    }

    return <LandingPage />
  }

  return (
    <AppProvider>
      {renderPage()}
    </AppProvider>
  )
}

export default App
