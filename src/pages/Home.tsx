import { useNavigate } from 'react-router-dom'

type Difficulty = 'easy' | 'medium' | 'hard'

const difficulties: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Lätt' },
  { value: 'medium', label: 'Medel' },
  { value: 'hard', label: 'Svårt' },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <main className="home">
      <section className="game-section">
        <h2 className="game-section__title">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 3v18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M4 4h14l-3 5 3 5H4V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" fill="currentColor" fillOpacity="0.15" />
          </svg>
          Gissa flaggor
        </h2>
        <div className="difficulty-buttons">
          {difficulties.map(({ value, label }) => (
            <button
              key={value}
              className={`diff-btn diff-btn--${value}`}
              onClick={() => navigate(`/guessFlags?difficulty=${value}`)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="game-section">
        <h2 className="game-section__title">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 12 Q6 6 9 12 Q12 18 15 12 Q18 6 21 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            <path d="M3 17 Q6 11 9 17 Q12 23 15 17 Q18 11 21 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
          </svg>
          Gissa floder
        </h2>
        <div className="difficulty-buttons">
          {difficulties.map(({ value, label }) => (
            <button
              key={value}
              className={`diff-btn diff-btn--${value}`}
              onClick={() => navigate(`/guessRivers?difficulty=${value}`)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="game-section">
        <h2 className="game-section__title">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
          </svg>
          Gissa huvudstäder
        </h2>
        <div className="difficulty-buttons">
          {difficulties.map(({ value, label }) => (
            <button
              key={value}
              className={`diff-btn diff-btn--${value}`}
              onClick={() => navigate(`/guessCapitals?difficulty=${value}`)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="game-section">
        <h2 className="game-section__title">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M13 2 L19 7 L16 10 L12 13 L13 16 L11 20 L9 22 L7 22 L6 20 L5 17 L6 14 L5 11 L6 8 L8 5 Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
              fill="currentColor"
              fillOpacity="0.15"
            />
          </svg>
          Gissa markerat land på karta
        </h2>
        <div className="difficulty-buttons">
          {difficulties.map(({ value, label }) => (
            <button
              key={value}
              className={`diff-btn diff-btn--${value}`}
              onClick={() => navigate(`/guessMap?difficulty=${value}`)}
            >
              {label}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
