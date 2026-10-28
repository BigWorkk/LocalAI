import { STATS, BADGES, LOOT } from './data'

export default function PlayerCard() {
  const earned = BADGES.filter(b => b.earned).length

  return (
    <div className="wm-scroll wm-scroll--roomy">
      <h1 className="wm-display wm-title-lg">Player card</h1>

      <section className="wm-card wm-card--tight wm-stack-14">
        <div className="wm-row-between wm-muted wm-text-sm">
          <span>Stat</span>
          <span>Now → Day 90 goal</span>
        </div>
        {STATS.map(st => (
          <div key={st.name} className="wm-stack-6">
            <div className="wm-row-between wm-text-md">
              <span className="wm-strong">{st.name}</span>
              <span className="wm-muted">{st.cur} → {st.goal}</span>
            </div>
            <div className="wm-stat-bar" role="img" aria-label={`${st.name}: ${st.cur} of 10 now, goal ${st.goal}`}>
              <div className="wm-stat-bar__goal" style={{ width: `${st.goal * 10}%` }} />
              <div className="wm-stat-bar__cur" style={{ width: `${st.cur * 10}%` }} />
            </div>
          </div>
        ))}
        <span className="wm-muted wm-text-xs">Re-rate yourself on Day 30, 60 and 90. Faint bar = goal.</span>
      </section>

      <section className="wm-stack-10">
        <div className="wm-row-between wm-row-baseline">
          <span className="wm-strong wm-text-base">Badges</span>
          <span className="wm-muted wm-text-sm">{earned} of {BADGES.length}</span>
        </div>
        <ul className="wm-grid-2 wm-grid-2--tight">
          {BADGES.map(b => (
            <li key={b.name} className={`wm-badge${b.earned ? ' wm-badge--earned' : ''}`}>
              <div className="wm-badge__icon" aria-hidden="true"><i className="fas fa-star" /></div>
              <span className="wm-strong wm-text-md">{b.name}{!b.earned && <span className="wm-sr-only"> (locked)</span>}</span>
              <span className="wm-muted wm-text-xs">{b.unlock}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="wm-stack-10">
        <span className="wm-strong wm-text-base">Loot you set for yourself</span>
        <div className="wm-card wm-card--sm wm-stack-14">
          {LOOT.map(l => (
            <div key={l.label} className="wm-stack-6">
              <div className="wm-row-between wm-text-md">
                <span>{l.label}</span>
                <span className="wm-muted">{l.progress}</span>
              </div>
              <div className="wm-meter"><div className="wm-meter__fill wm-meter__fill--gold" style={{ width: `${l.pct}%` }} /></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
