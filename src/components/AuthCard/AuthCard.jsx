import './AuthCard.css'

export default function AuthCard({ children}) {
  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="auth-card__signal" aria-hidden="true" />
      <div className="auth-card__header">
        <div className="auth-card__logo" aria-label="SCORPIO logo placeholder">
          <span className="auth-card__logo-orbit" />
          <span className="auth-card__logo-core">S</span>
        </div>
        <div>
          <p className="auth-card__eyebrow">Iot UC</p>
          <h1 id="auth-title">SCORPIO</h1>
        </div>
      </div>
      {children}
      <a href='/'>Home</a>
      <div className="auth-card__hosted-by">
        <span>Powered by</span>
        <a href="https://cpsrtc.cl" target="_blank" rel="noopener noreferrer" aria-label="CPS-RTC">
          <img src="/cps-rtc-horizontal-white.svg" alt="CPS-RTC" />
        </a>
      </div>
    </section>
  )
}
