import { useState } from 'react'
import { Link } from 'react-router-dom'
import { WINGMAN_BASE, levelFor } from './data'

const SHORTCUTS = [
  { to: `${WINGMAN_BASE}/chat`, icon: 'fas fa-lightbulb', title: 'Opener Lab', sub: 'Openers built for her profile' },
  { to: `${WINGMAN_BASE}/hype`, icon: 'fas fa-bolt', title: 'Hype Mode', sub: '60 seconds before you walk in' },
  { to: `${WINGMAN_BASE}/debrief`, icon: 'fas fa-clipboard-list', title: 'Debrief', sub: '30-second log after any rep' },
  { to: `${WINGMAN_BASE}/quests`, icon: 'fas fa-star', title: 'Weekly Boss', sub: 'Learn two names · 40 XP' },
]

export default function WingmanHome({ xp, quests, addXp }) {
  const [showToast, setShowToast] = useState(false)
  const { level, rank, toNext, pct } = levelFor(xp)
  const doneCount = quests.filter(Boolean).length

  const logRep = () => {
    addXp(10)
    setShowToast(true)
  }

  return (
    <div className="wm-scroll">
      <div className="wm-player">
        <div className="wm-avatar" aria-hidden="true">J</div>
        <div className="wm-player__text">
          <span className="wm-muted wm-text-sm">Player One</span>
          <span className="wm-display wm-player__level">Level {level} · {rank}</span>
        </div>
        <div className="wm-pill wm-pill--coral">
          <i className="fas fa-fire" aria-hidden="true" />
          <span>5-day streak</span>
        </div>
      </div>

      <section className="wm-card wm-stack-12">
        <div className="wm-row-between wm-row-baseline">
          <span className="wm-display wm-xp">{xp.toLocaleString()} XP</span>
          <span className="wm-muted wm-text-sm">{toNext} XP to Level {level + 1}</span>
        </div>
        <div className="wm-meter wm-meter--lg" role="progressbar" aria-label="Progress to next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="wm-meter__fill" style={{ width: `${pct}%` }} />
        </div>
        <button type="button" className="wm-btn wm-btn--primary" onClick={logRep}>Log a rep · +10 XP</button>
        {showToast && (
          <span className="wm-text-sm wm-teal-text" role="status">Nice. Awkward reps count the same as smooth ones.</span>
        )}
      </section>

      <section className="wm-card wm-card--outlined wm-stack-10">
        <span className="wm-eyebrow wm-teal-text">Today's mission</span>
        <span className="wm-display wm-title-md">Ask a stranger a real question</span>
        <span className="wm-muted wm-text-md">Rung 2 · The Opener · 10 XP · cleared 2 of 3</span>
        <div className="wm-btn-row">
          <Link to={`${WINGMAN_BASE}/hype`} className="wm-btn wm-btn--quiet">Hype me up</Link>
          <Link to={`${WINGMAN_BASE}/debrief`} className="wm-btn wm-btn--teal">Did it. Debrief</Link>
        </div>
      </section>

      <div className="wm-bubble-row">
        <div className="wm-bot-avatar" aria-hidden="true"><i className="fas fa-comment" /></div>
        <div className="wm-bubble wm-bubble--bot">
          Group ride tomorrow at 6. One job: learn one name and use it before you leave. That's it. I'll handle the rest of the week.
        </div>
      </div>

      <div className="wm-grid-2">
        {SHORTCUTS.map(s => (
          <Link key={s.title} to={s.to} className="wm-tile">
            <i className={`${s.icon} wm-tile__icon`} aria-hidden="true" />
            <span className="wm-tile__title">{s.title}</span>
            <span className="wm-muted wm-text-xs">{s.sub}</span>
          </Link>
        ))}
      </div>

      <section className="wm-stack-10">
        <div className="wm-row-between wm-text-md">
          <span className="wm-strong">This week's loop</span>
          <span className="wm-muted">{doneCount} of {quests.length} done</span>
        </div>
        <div className="wm-segments" aria-hidden="true">
          {quests.map((done, i) => (
            <div key={i} className={`wm-segment${done ? ' wm-segment--done' : ''}`} />
          ))}
        </div>
      </section>
    </div>
  )
}
