import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getByDifficulty, type CapitalQuestion, type Difficulty } from '../data/guessCapitals'
import { citiesByCountry } from '../data/cities'
import '../styles/quiz.css'

interface QuizQuestion {
  correct: CapitalQuestion
  options: Option[]
}

interface Option {
  id: string      // country code, or city name prefixed with "city:"
  label: string   // the text shown on the button
  isCorrect: boolean
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildSession(difficulty: Difficulty, count = 20): QuizQuestion[] {
  const pool = getByDifficulty(difficulty)
  const selected = shuffle(pool).slice(0, count)

  // Collect all non-capital cities from the pool as potential distractors
  const allCities: string[] = pool.flatMap((c) => citiesByCountry[c.code] ?? [])

  return selected.map((correct) => {
    const correctOption: Option = { id: correct.code, label: correct.capital, isCorrect: true }

    // 2–3 cities from the correct country as distractors
    const countryCities = shuffle(citiesByCountry[correct.code] ?? [])
    const citySlots = Math.min(countryCities.length, Math.floor(Math.random() * 2) + 2)
    const wrongCities = countryCities
      .slice(0, citySlots)
      .map((city): Option => ({ id: `city:${city}`, label: city, isCorrect: false }))

    // Fill remaining slots with other countries' capitals (same region first)
    const capitalSlots = 5 - wrongCities.length
    const sameRegion = shuffle(pool.filter((c) => c.code !== correct.code && c.region === correct.region))
    const otherRegion = shuffle(pool.filter((c) => c.code !== correct.code && c.region !== correct.region))
    const wrongCapitals = [...sameRegion, ...otherRegion]
      .slice(0, capitalSlots)
      .map((c): Option => ({ id: c.code, label: c.capital, isCorrect: false }))

    const options = shuffle([correctOption, ...wrongCities, ...wrongCapitals])
    return { correct, options }
  })
}

function Results({
  session,
  answers,
  onRestart,
}: {
  session: QuizQuestion[]
  answers: (string | null)[]
  onRestart: () => void
}) {
  const navigate = useNavigate()
  const correct = answers.filter((a, i) => a !== null && session[i].options.find((o) => o.id === a)?.isCorrect).length
  const total = session.length

  return (
    <div className="quiz-results">
      <div className="quiz-results__score">
        <span className="quiz-results__score-num">{correct}</span>
        <span className="quiz-results__score-sep">/</span>
        <span className="quiz-results__score-total">{total}</span>
      </div>
      <p className="quiz-results__label">rätt svar</p>

      <ul className="quiz-results__list">
        {session.map((q, i) => {
          const wasCorrect = answers[i] !== null && q.options.find((o) => o.id === answers[i])?.isCorrect === true
          return (
            <li key={q.correct.code} className={`quiz-results__item quiz-results__item--${wasCorrect ? 'correct' : 'wrong'}`}>
              <img
                className="quiz-results__flag"
                src={`https://flagcdn.com/w80/${q.correct.code}.png`}
                alt=""
              />
              <span className="quiz-results__country">
                {q.correct.name} – <strong>{q.correct.capital}</strong>
              </span>
              {wasCorrect ? (
                <span className="quiz-results__icon">✓</span>
              ) : (
                <span className="quiz-results__icon">✗</span>
              )}
            </li>
          )
        })}
      </ul>

      <div className="quiz-results__actions">
        <button className="quiz-results__btn quiz-results__btn--primary" onClick={onRestart}>
          Kör igen
        </button>
        <button className="quiz-results__btn" onClick={() => navigate('/')}>
          Till startsidan
        </button>
      </div>
    </div>
  )
}

export default function GuessCapitals() {
  const [searchParams] = useSearchParams()
  const difficulty = (searchParams.get('difficulty') ?? 'easy') as Difficulty

  const [session, setSession] = useState<QuizQuestion[]>(() => buildSession(difficulty))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(Array(20).fill(null))
  const [showResults, setShowResults] = useState(false)

  const question = session[currentIndex]
  const selectedAnswer = answers[currentIndex]
  const total = session.length

  const optionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function trapFocus(e: KeyboardEvent) {
      if (e.key !== 'Tab') return
      const container = optionsRef.current
      if (!container) return
      const buttons = Array.from(container.querySelectorAll<HTMLElement>('button:not([disabled])'))
      if (buttons.length === 0) return
      e.preventDefault()
      const index = buttons.indexOf(document.activeElement as HTMLElement)
      if (e.shiftKey) {
        buttons[index <= 0 ? buttons.length - 1 : index - 1].focus()
      } else {
        buttons[index >= buttons.length - 1 ? 0 : index + 1].focus()
      }
    }
    document.addEventListener('keydown', trapFocus)
    return () => document.removeEventListener('keydown', trapFocus)
  }, [])

  useEffect(() => {
    if (answers.every((a) => a !== null)) {
      const timer = setTimeout(() => setShowResults(true), 600)
      return () => clearTimeout(timer)
    }
  }, [answers])

  useEffect(() => {
    if (selectedAnswer === null) return
    if (currentIndex >= total - 1) return
    const isCorrect = question.options.find((o) => o.id === selectedAnswer)?.isCorrect === true
    const timer = setTimeout(() => setCurrentIndex((i) => i + 1), isCorrect ? 1000 : 2000)
    return () => clearTimeout(timer)
  }, [selectedAnswer])

  function handleAnswer(code: string) {
    if (selectedAnswer !== null) return
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = code
      return next
    })
  }

  function getOptionState(option: Option): 'correct' | 'wrong' | 'idle' {
    if (selectedAnswer === null) return 'idle'
    if (option.isCorrect) return 'correct'
    if (option.id === selectedAnswer) return 'wrong'
    return 'idle'
  }

  function handleRestart() {
    setSession(buildSession(difficulty))
    setAnswers(Array(20).fill(null))
    setCurrentIndex(0)
    setShowResults(false)
  }

  if (showResults) {
    return <Results session={session} answers={answers} onRestart={handleRestart} />
  }

  return (
    <div className="quiz">
      <div className="quiz__topbar">
        <span className={`quiz__difficulty quiz__difficulty--${difficulty}`}>
          {difficulty === 'easy' ? 'Lätt' : difficulty === 'medium' ? 'Medel' : 'Svårt'}
        </span>
        <span className="quiz__counter">{currentIndex + 1} / {total}</span>
      </div>

      <div className="quiz__flag-row">
        {currentIndex > 0 ? (
          <button
            className="quiz__nav-btn"
            onClick={() => setCurrentIndex((i) => i - 1)}
            aria-label="Föregående fråga"
            tabIndex={-1}
          >
            ←
          </button>
        ) : (
          <div className="quiz__nav-placeholder" />
        )}
        <div className="quiz__flag-wrap">
          <img
            key={question.correct.code}
            className="quiz__flag"
            src={`https://flagcdn.com/w320/${question.correct.code}.png`}
            alt={`Flagga för ${question.correct.name}`}
          />
        </div>
        <button
          className="quiz__nav-btn"
          onClick={() => setCurrentIndex((i) => i + 1)}
          disabled={currentIndex === total - 1}
          aria-label="Nästa fråga"
          tabIndex={-1}
        >
          →
        </button>
      </div>

      <p className="quiz__prompt">Vad är huvudstaden i <strong>{question.correct.name}</strong>?</p>

      <div className="quiz__options" ref={optionsRef}>
        {question.options.map((option) => {
          const state = getOptionState(option)
          return (
            <button
              key={option.id}
              className={`quiz__option quiz__option--${state}`}
              onClick={() => handleAnswer(option.id)}
              disabled={selectedAnswer !== null && state === 'idle'}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
