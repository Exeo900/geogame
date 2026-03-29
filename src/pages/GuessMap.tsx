import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { ComposableMap, Geographies, Geography } from 'react-simple-maps'
import { getByDifficulty, type MapCountry, type Difficulty } from '../data/guessMap'
import '../styles/quiz.css'
import '../styles/map.css'

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json'

type Region = MapCountry['region']

const regionProjection: Record<Region, { center: [number, number]; scale: number }> = {
  Europa:      { center: [15, 54],   scale: 560 },
  Nordamerika: { center: [-96, 42],  scale: 260 },
  Sydamerika:  { center: [-60, -18], scale: 280 },
  Afrika:      { center: [20, 2],    scale: 255 },
  Asien:       { center: [100, 38],  scale: 210 },
  Mellanöstern:{ center: [47, 28],   scale: 490 },
  Oceanien:    { center: [158, -22], scale: 295 },
}

function getProjection(country: MapCountry): { center: [number, number]; scale: number } {
  const region = regionProjection[country.region]
  const countryScale = Math.min(10000, 300000 / Math.sqrt(country.area))
  if (countryScale > region.scale) {
    return { center: country.center, scale: countryScale }
  }
  return region
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function WorldMap({ country }: { country: MapCountry }) {
  const target = getProjection(country)
  const start = regionProjection[country.region]
  const { numericCode } = country

  const [proj, setProj] = useState<{ center: [number, number]; scale: number }>(start)
  const animRef = useRef<{ delayId?: ReturnType<typeof setTimeout>; rafId?: number }>({})

  function cancelAnim() {
    clearTimeout(animRef.current.delayId)
    cancelAnimationFrame(animRef.current.rafId!)
  }

  useEffect(() => {
    animRef.current.delayId = setTimeout(() => {
      const t0 = performance.now()
      const duration = 1200
      function animate(now: number) {
        const t = Math.min((now - t0) / duration, 1)
        const e = easeInOutCubic(t)
        setProj({
          center: [
            start.center[0] + (target.center[0] - start.center[0]) * e,
            start.center[1] + (target.center[1] - start.center[1]) * e,
          ],
          scale: start.scale + (target.scale - start.scale) * e,
        })
        if (t < 1) animRef.current.rafId = requestAnimationFrame(animate)
      }
      animRef.current.rafId = requestAnimationFrame(animate)
    }, 1000)
    return cancelAnim
  }, [])

  function handleZoom(factor: number) {
    cancelAnim()
    setProj(p => ({
      ...p,
      scale: Math.min(8000, Math.max(100, p.scale * factor)),
    }))
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <ComposableMap
      projection="geoMercator"
      projectionConfig={{ center: proj.center, scale: proj.scale }}
      style={{ width: '100%', height: '100%' }}
    >
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              style={{
                default: {
                  fill: geo.id === numericCode ? 'var(--accent)' : 'var(--map-land)',
                  stroke: 'var(--map-stroke)',
                  strokeWidth: 0.5,
                  outline: 'none',
                },
                hover: { outline: 'none' },
                pressed: { outline: 'none' },
              }}
            />
          ))
        }
      </Geographies>
    </ComposableMap>
    <div className="map-zoom-controls">
      <button className="map-zoom-btn" onClick={() => handleZoom(1.5)} tabIndex={-1} aria-label="Zooma in">+</button>
      <button className="map-zoom-btn" onClick={() => handleZoom(1 / 1.5)} tabIndex={-1} aria-label="Zooma ut">−</button>
    </div>
    </div>
  )
}

interface QuizQuestion {
  correct: MapCountry
  options: MapCountry[]
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
    const options = shuffle([correct, ...[...sameRegion, ...otherRegion].slice(0, 5)])
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
            <li
              key={q.correct.code}
              className={`quiz-results__item quiz-results__item--${wasCorrect ? 'correct' : 'wrong'}`}
            >
              <span className="quiz-results__country">{q.correct.name}</span>
              <span className="quiz-results__meta">{q.correct.region}</span>
              <span className="quiz-results__icon">{wasCorrect ? '✓' : '✗'}</span>
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

export default function GuessMap() {
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
    const timer = setTimeout(() => setCurrentIndex((i) => i + 1), 1000)
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

      <div className="map-wrap">
        <WorldMap key={question.correct.code} country={question.correct} />
      </div>

      <p className="quiz__prompt">Vilket land är markerat på kartan?</p>

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
