'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Hint = 'too_high' | 'too_low' | 'correct'
type GameStatus = 'playing' | 'won'

interface Attempt {
  number: number
  hint: Hint
}

const MAX = 100
const MIN = 1

const CONFETTI_COLORS = [
  'bg-yellow-400',
  'bg-pink-500',
  'bg-blue-400',
  'bg-green-400',
  'bg-orange-400',
  'bg-purple-400',
  'bg-red-400',
  'bg-cyan-400',
]

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function hintText(hint: Hint) {
  if (hint === 'too_high') return '📉 Muy alto'
  if (hint === 'too_low') return '📈 Muy bajo'
  return '🎯 ¡Correcto!'
}

function hintColor(hint: Hint) {
  if (hint === 'too_high') return 'text-red-400'
  if (hint === 'too_low') return 'text-blue-400'
  return 'text-green-400'
}

function attemptBg(hint: Hint) {
  if (hint === 'too_high') return 'bg-red-900/30 border-red-500/40'
  if (hint === 'too_low') return 'bg-blue-900/30 border-blue-500/40'
  return 'bg-green-900/30 border-green-500/40'
}

function getRangeHint(attempts: Attempt[]): { low: number; high: number } {
  let low = MIN
  let high = MAX
  for (const a of attempts) {
    if (a.hint === 'too_low' && a.number > low) low = a.number
    if (a.hint === 'too_high' && a.number < high) high = a.number
  }
  return { low, high }
}

interface ConfettiPiece {
  id: number
  left: string
  delay: string
  color: string
  size: string
}

function generateConfetti(n: number): ConfettiPiece[] {
  return Array.from({ length: n }, (_, i) => ({
    id: i,
    left: `${randomBetween(0, 100)}%`,
    delay: `${(randomBetween(0, 20) / 10).toFixed(1)}s`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: randomBetween(6, 14) + 'px',
  }))
}

export function GameBoard() {
  const [secret, setSecret] = useState<number>(() => randomBetween(MIN, MAX))
  const [input, setInput] = useState('')
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [status, setStatus] = useState<GameStatus>('playing')
  const [shakeKey, setShakeKey] = useState(0)
  const [slideKey, setSlideKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const historyEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [attempts])

  useEffect(() => {
    if (status === 'playing') inputRef.current?.focus()
  }, [status])

  const resetGame = useCallback(() => {
    setSecret(randomBetween(MIN, MAX))
    setInput('')
    setAttempts([])
    setStatus('playing')
    setError(null)
    setConfetti([])
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleGuess = useCallback(() => {
    const num = parseInt(input, 10)
    if (isNaN(num) || input.trim() === '') {
      setError('Por favor ingresa un número válido.')
      setShakeKey((k) => k + 1)
      return
    }
    if (num < MIN || num > MAX) {
      setError(`El número debe estar entre ${MIN} y ${MAX}.`)
      setShakeKey((k) => k + 1)
      return
    }
    // Check duplicate
    if (attempts.some((a) => a.number === num)) {
      setError(`Ya intentaste con ${num}. ¡Prueba otro!`)
      setShakeKey((k) => k + 1)
      return
    }

    setError(null)
    let hint: Hint
    if (num > secret) hint = 'too_high'
    else if (num < secret) hint = 'too_low'
    else hint = 'correct'

    const newAttempts = [...attempts, { number: num, hint }]
    setAttempts(newAttempts)
    setSlideKey((k) => k + 1)
    setInput('')

    if (hint === 'correct') {
      setStatus('won')
      setConfetti(generateConfetti(40))
    }
  }, [input, attempts, secret])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleGuess()
  }

  const lastAttempt = attempts[attempts.length - 1]
  const { low, high } = getRangeHint(attempts)
  const range = high - low - 1
  const progressPct =
    attempts.length === 0
      ? 0
      : Math.max(0, Math.min(100, ((MAX - MIN - range) / (MAX - MIN)) * 100))

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className={`fixed top-0 rounded-sm animate-confetti_fall ${piece.color} pointer-events-none z-50`}
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            width: piece.size,
            height: piece.size,
          }}
        />
      ))}

      {/* Background blobs */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="text-center animate-float">
          <div className="text-6xl mb-2">🎲</div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Adivina el Número</h1>
          <p className="text-purple-300 mt-1 text-sm">
            Elige un número entre <span className="font-bold text-white">{MIN}</span> y{' '}
            <span className="font-bold text-white">{MAX}</span>
          </p>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 justify-center">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center flex-1">
            <p className="text-xs text-purple-300 font-medium uppercase tracking-widest">
              Intentos
            </p>
            <p className="text-3xl font-black text-white mt-1">{attempts.length}</p>
          </div>
          {attempts.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-center flex-1">
              <p className="text-xs text-purple-300 font-medium uppercase tracking-widest">
                Rango actual
              </p>
              <p className="text-lg font-black text-white mt-1">
                {low === MIN ? MIN : low + 1} – {high === MAX ? MAX : high - 1}
              </p>
            </div>
          )}
        </div>

        {/* Progress bar */}
        {attempts.length > 0 && (
          <div>
            <div className="flex justify-between text-xs text-purple-400 mb-1">
              <span>Progreso del rango eliminado</span>
              <span>{Math.round(progressPct)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {/* Won state */}
        {status === 'won' ? (
          <div className="bg-green-900/40 border border-green-500/50 rounded-3xl p-8 text-center animate-bounce_in">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold text-green-300">¡Lo lograste!</h2>
            <p className="text-white/80 mt-2">
              El número era <span className="text-green-300 font-black text-xl">{secret}</span> y lo
              adivinaste en{' '}
              <span className="text-green-300 font-black text-xl">{attempts.length}</span>{' '}
              {attempts.length === 1 ? 'intento' : 'intentos'}.
            </p>
            {attempts.length <= 5 && (
              <p className="text-yellow-300 font-semibold mt-2 text-sm">⭐ ¡Excelente desempeño!</p>
            )}
            <button
              onClick={resetGame}
              className="mt-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 active:scale-95 shadow-lg shadow-green-900/40"
            >
              🔄 Jugar de nuevo
            </button>
          </div>
        ) : (
          /* Input area */
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 animate-pulse_glow">
            {lastAttempt && (
              <div
                className={`text-center text-lg font-bold ${hintColor(lastAttempt.hint)} animate-slide_up`}
                key={slideKey}
              >
                {lastAttempt.hint === 'too_high'
                  ? '⬇️ ¡Demasiado alto! Intenta con uno menor.'
                  : '⬆️ ¡Demasiado bajo! Intenta con uno mayor.'}
              </div>
            )}

            <div key={shakeKey} className={shakeKey > 0 ? 'animate-shake' : ''}>
              <input
                ref={inputRef}
                type="number"
                min={MIN}
                max={MAX}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  setError(null)
                }}
                onKeyDown={handleKeyDown}
                placeholder={`Número entre ${MIN} y ${MAX}…`}
                className="w-full bg-white/10 border border-white/20 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/40 outline-none rounded-2xl px-5 py-4 text-white text-center text-xl font-bold placeholder:text-white/30 transition-all duration-200 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center font-medium animate-slide_up">
                {error}
              </p>
            )}

            <button
              onClick={handleGuess}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-95 text-white font-extrabold py-4 rounded-2xl transition-all duration-200 text-lg shadow-lg shadow-purple-900/50"
            >
              🎯 Adivinar
            </button>

            <button
              onClick={resetGame}
              className="w-full text-white/40 hover:text-white/70 text-sm font-medium transition-colors duration-200 py-1"
            >
              🔄 Nueva partida
            </button>
          </div>
        )}

        {/* History */}
        {attempts.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
            <h3 className="text-purple-300 font-bold text-xs uppercase tracking-widest mb-3">
              Historial de intentos
            </h3>
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
              {attempts.map((a, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between border rounded-xl px-4 py-2 ${attemptBg(a.hint)}`}
                >
                  <span className="text-white/50 text-xs font-mono w-6">#{i + 1}</span>
                  <span className="text-white font-black text-lg">{a.number}</span>
                  <span className={`text-sm font-semibold ${hintColor(a.hint)}`}>
                    {hintText(a.hint)}
                  </span>
                </div>
              ))}
              <div ref={historyEndRef} />
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
