import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getByDifficulty, type FlagQuestion, type Difficulty } from '../data/guessFlags'
import '../styles/quiz.css'

interface QuizQuestion {
  correct: FlagQuestion
  options: FlagQuestion[]
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
  return selected.map((correct) => {
    const sameRegion = shuffle(pool.filter((c) => c.code !== correct.code && c.region === correct.region))
    const otherRegion = shuffle(pool.filter((c) => c.code !== correct.code && c.region !== correct.region))
    const wrongOptions = [...sameRegion, ...otherRegion].slice(0, 5)
    const options = shuffle([correct, ...wrongOptions])
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
  const correct = answers.filter((a, i) => a === session[i].correct.code).length
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
          const wasCorrect = answers[i] === q.correct.code
          return (
            <li key={q.correct.code} className={`quiz-results__item quiz-results__item--${wasCorrect ? 'correct' : 'wrong'}`}>
              <img
                className="quiz-results__flag"
                src={`https://flagcdn.com/w80/${q.correct.code}.png`}
                alt=""
              />
              <span className="quiz-results__country">{q.correct.name}</span>
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

export default function GuessFlags() {
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
    const isCorrect = selectedAnswer === question.correct.code
    const timer = setTimeout(() => setCurrentIndex((i) => i + 1), 500)
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

  function getOptionState(code: string): 'correct' | 'wrong' | 'idle' {
    if (selectedAnswer === null) return 'idle'
    if (code === question.correct.code) return 'correct'
    if (code === selectedAnswer) return 'wrong'
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
            alt="Flagga"
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

      <p className="quiz__prompt">Vilket land tillhör den här flaggan?</p>

      <div className="quiz__options" ref={optionsRef}>
        {question.options.map((option) => {
          const state = getOptionState(option.code)
          return (
            <button
              key={option.code}
              className={`quiz__option quiz__option--${state}`}
              onClick={() => handleAnswer(option.code)}
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
