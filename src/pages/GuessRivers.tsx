import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getByDifficulty, type RiverQuiz, type QuestionType } from '../data/guessRivers'
import '../styles/quiz.css'
import '../styles/rivers.css'

interface RiverQuestion {
  river: RiverQuiz
  options: RiverQuiz[]
  type: QuestionType
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildSession(): RiverQuestion[] {
  const pool = getByDifficulty()
  const count = Math.min(pool.length, 10)
  const selected = shuffle(pool).slice(0, count)

  return selected.map((river) => {
    const others = shuffle(pool.filter((r) => r.id !== river.id)).slice(0, 5)
    const options = shuffle([river, ...others])
    const type: QuestionType = river.image ? 'image' : 'clues'
    return { river, options, type }
  })
}

function RiverResults({
  session,
  answers,
  onRestart,
}: {
  session: RiverQuestion[]
  answers: (string | null)[]
  onRestart: () => void
}) {
  const navigate = useNavigate()
  const correct = answers.filter((a, i) => a === session[i].river.id).length
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
          const wasCorrect = answers[i] === q.river.id
          return (
            <li key={q.river.id} className={`quiz-results__item quiz-results__item--${wasCorrect ? 'correct' : 'wrong'}`}>
              <span className="quiz-results__country">{q.river.name}</span>
              <span className="quiz-results__meta">{q.river.continent} · {q.river.length.toLocaleString('sv')} km</span>
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

export default function GuessRivers() {
  const [session, setSession] = useState<RiverQuestion[]>(() => buildSession())
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(() => Array(Math.min(getByDifficulty().length, 10)).fill(null))
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
    const isCorrect = selectedAnswer === question.river.id
    const timer = setTimeout(() => setCurrentIndex((i) => i + 1), isCorrect ? 1000 : 1250)
    return () => clearTimeout(timer)
  }, [selectedAnswer])

  function handleAnswer(id: string) {
    if (selectedAnswer !== null) return
    setAnswers((prev) => {
      const next = [...prev]
      next[currentIndex] = id
      return next
    })
  }

  function getOptionState(id: string): 'correct' | 'wrong' | 'idle' {
    if (selectedAnswer === null) return 'idle'
    if (id === question.river.id) return 'correct'
    if (id === selectedAnswer) return 'wrong'
    return 'idle'
  }

  function handleRestart() {
    const newSession = buildSession()
    setSession(newSession)
    setAnswers(Array(newSession.length).fill(null))
    setCurrentIndex(0)
    setShowResults(false)
  }

  if (showResults) {
    return <RiverResults session={session} answers={answers} onRestart={handleRestart} />
  }

  return (
    <div className="quiz">
      <div className="quiz__topbar">
        <span className="quiz__counter">{currentIndex + 1} / {total}</span>
      </div>

      {question.type === 'image' && question.river.image ? (
        <div className="quiz__flag-row">
          {currentIndex > 0 ? (
            <button className="quiz__nav-btn" onClick={() => setCurrentIndex((i) => i - 1)} aria-label="Föregående" tabIndex={-1}>←</button>
          ) : (
            <div className="quiz__nav-placeholder" />
          )}
          <div className="quiz__flag-wrap">
            <img
              key={question.river.id}
              className="quiz__flag river-img"
              src={`/images/rivers/${question.river.image}`}
              alt="Flod"
            />
          </div>
          <button
            className="quiz__nav-btn"
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={currentIndex === total - 1}
            aria-label="Nästa"
            tabIndex={-1}
          >→</button>
        </div>
      ) : (
        <div className="river-clues-row">
          {currentIndex > 0 ? (
            <button className="quiz__nav-btn" onClick={() => setCurrentIndex((i) => i - 1)} aria-label="Föregående" tabIndex={-1}>←</button>
          ) : (
            <div className="quiz__nav-placeholder" />
          )}
          <div className="river-clues">
            <p className="river-clues__item">
              <span className="river-clues__label">Världsdel</span>
              <span className="river-clues__value">{question.river.continent}</span>
            </p>
            <p className="river-clues__item">
              <span className="river-clues__label">Längd</span>
              <span className="river-clues__value">{question.river.length.toLocaleString('sv')} km</span>
            </p>
            <p className="river-clues__item">
              <span className="river-clues__label">Rinner genom</span>
              <span className="river-clues__value">{question.river.countries.join(', ')}</span>
            </p>
            <p className="river-clues__item">
              <span className="river-clues__label">Mynnar ut i</span>
              <span className="river-clues__value">{question.river.outflow}</span>
            </p>
          </div>
          <button
            className="quiz__nav-btn"
            onClick={() => setCurrentIndex((i) => i + 1)}
            disabled={currentIndex === total - 1}
            aria-label="Nästa"
            tabIndex={-1}
          >→</button>
        </div>
      )}

      <p className="quiz__prompt">Vilken flod är detta?</p>

      <div className="quiz__options" ref={optionsRef}>
        {question.options.map((option) => {
          const state = getOptionState(option.id)
          return (
            <button
              key={option.id}
              className={`quiz__option quiz__option--${state}`}
              onClick={() => handleAnswer(option.id)}
              disabled={selectedAnswer !== null && state === 'idle'}
            >
              {option.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
