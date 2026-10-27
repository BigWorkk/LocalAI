import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { WINGMAN_BASE } from './data'
import { WingmanBackLink } from './WingmanTabBar'

const PHASES = [
  { name: 'Breathe in', count: '4 seconds', size: 190 },
  { name: 'Hold', count: '4 seconds', size: 190 },
  { name: 'Breathe out', count: '6 seconds', size: 120 },
]
const IDLE = { name: 'Ready', count: 'Tap start', size: 150 }
const PHASE_MS = 4000

const PLAN = [
  'Say hi first.',
  'Ask one real question. Listen to the answer.',
  'Leave on a high note. Short beats long.',
]

export default function HypeMode() {
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setPhase(p => (p + 1) % PHASES.length), PHASE_MS)
    return () => clearInterval(id)
  }, [running])

  const toggle = () => {
    if (!running) setPhase(0)
    setRunning(r => !r)
  }

  const p = running ? PHASES[phase] : IDLE

  return (
    <div className="wm-scroll wm-scroll--focused">
      <WingmanBackLink />

      <header className="wm-stack-6">
        <span className="wm-eyebrow wm-coral-text">Hype Mode</span>
        <h1 className="wm-display wm-title-lg">60 seconds. Then you walk in.</h1>
      </header>

      <div className="wm-breathe">
        <div className="wm-breathe__ring">
          <div className="wm-breathe__orb" style={{ width: p.size, height: p.size }} aria-live="polite">
            <span className="wm-display wm-title-md">{p.name}</span>
            <span className="wm-muted wm-text-sm">{p.count}</span>
          </div>
        </div>
        <button type="button" className="wm-btn wm-btn--outline-teal" onClick={toggle}>
          {running ? 'Pause' : 'Start breathing'}
        </button>
      </div>

      <section className="wm-card wm-stack-14">
        <span className="wm-strong wm-text-base">Your whole game plan</span>
        <ol className="wm-plan">
          {PLAN.map((step, i) => (
            <li key={step}>
              <span className="wm-plan__num" aria-hidden="true">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="wm-callout">
        <i className="fas fa-shield-halved" aria-hidden="true" />
        <span>Rejection Shield is on. A "no" pays full XP plus 5 Courage. There is no losing move tonight.</span>
      </div>

      <Link to={`${WINGMAN_BASE}/debrief`} className="wm-btn wm-btn--primary wm-btn--lg">I'm going in</Link>
    </div>
  )
}
