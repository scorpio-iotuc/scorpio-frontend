import { useState } from 'react'
import AuthCard from '../../components/AuthCard/AuthCard'
import { signup } from '../../services/authService'
import '../Login/Login.css'
import './SignUp.css'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [signupDisabled, setSignupDisabled] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
    setError('')
  }

  function validateForm() {
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      return 'All the fields must be provided.'
    }

    if (!emailPattern.test(formData.email)) {
      return 'You must enter a valid email.'
    }

    if (formData.password.length < 6) {
      return 'The password require at least 6 characters.'
    }

    if (formData.password !== formData.confirmPassword) {
      return 'The passwords do not match.'
    }

    return ''
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      await signup(formData.name.trim(), formData.email.trim(), formData.password)
      setSuccessMessage('Account created. Redirecting to login panel...')
      window.setTimeout(() => {
        window.location.assign('/login')
      }, 1200)
    } catch (requestError) {
      if (requestError.status === 403) {
        setSignupDisabled(true)
      } else {
        setError(requestError.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  function goToLogin() {
    window.location.assign('/login')
  }

  return (
    <main className="auth-page auth-page--signup">
      <div className="auth-page__background" aria-hidden="true">
        <span className="auth-page__satellite-path" />
      </div>

      <AuthCard>
        {signupDisabled ? (
          <>
            <p className="auth-form__message auth-form__message--info" role="status">
              El registro esta deshabilitado. Contacta a un administrador.
            </p>
            <a className="auth-form__button auth-form__button--secondary" href="/login">
              Ir a login
            </a>
          </>
        ) : (
        <form className="auth-form auth-form--signup" onSubmit={handleSubmit} noValidate>
          <div className="auth-form__field">
            <label htmlFor="signup-name">User name</label>
            <input
              id="signup-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              autoComplete="name"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="signup-email">Email</label>
            <input
              id="signup-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@scorpio.space"
              autoComplete="email"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="signup-password">Password</label>
            <input
              id="signup-password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Min 6 characters required"
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          <div className="auth-form__field">
            <label htmlFor="signup-confirm-password">Confirm password</label>
            <input
              id="signup-confirm-password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Enter your password again"
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              required
            />
          </div>

          {error && (
            <p className="auth-form__message auth-form__message--error" role="alert">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="auth-form__message auth-form__message--success" role="status">
              {successMessage}
            </p>
          )}

          <button className="auth-form__button auth-form__button--primary" type="submit" disabled={isLoading}>
            {isLoading ? <span className="auth-form__loader" aria-hidden="true" /> : null}
            {isLoading ? 'Creating account...' : 'New account'}
          </button>

          <button className="auth-form__button auth-form__button--secondary" type="button" onClick={goToLogin}>
            Login
          </button>
        </form>
        )}
      </AuthCard>
    </main>
  )
}
