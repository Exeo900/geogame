import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo-link">
          <svg className="site-header__globe" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
            <ellipse cx="12" cy="12" rx="4" ry="10" stroke="currentColor" strokeWidth="1.5" />
            <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4.5 7h15M4.5 17h15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <span className="site-header__title">Geo Game</span>
        </Link>
      </div>
    </header>
  )
}
