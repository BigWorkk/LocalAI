import { RUNGS, CURRENT_RUNG } from './data'

export default function NervesLadder() {
  return (
    <div className="wm-scroll">
      <header className="wm-stack-6">
        <h1 className="wm-display wm-title-lg">Nerves Ladder</h1>
        <span className="wm-muted wm-text-md">Clear each rung 3 times to climb. You earn XP for trying, not for how it goes.</span>
      </header>

      <div className="wm-callout wm-callout--row">
        <i className="fas fa-shield-halved" aria-hidden="true" />
        <span className="wm-grow">Rejection Shield: every "no" pays full XP + 5 Courage</span>
        <span className="wm-display wm-callout__stat">15</span>
      </div>

      <ol className="wm-rungs">
        {RUNGS.map((rung, i) => {
          const state = i < CURRENT_RUNG ? 'done' : (i === CURRENT_RUNG ? 'now' : 'locked')
          return (
            <li key={rung.name} className={`wm-rung wm-rung--${state}`} aria-current={state === 'now' ? 'step' : undefined}>
              <div className="wm-rung__num wm-display">{i + 1}</div>
              <div className="wm-rung__body">
                <div className="wm-row-between">
                  <span className="wm-strong wm-text-base">{rung.name}</span>
                  <span className="wm-gold-text wm-text-sm wm-strong">{rung.xp} XP</span>
                </div>
                <span className="wm-muted wm-text-sm">{rung.desc}</span>
                <div className="wm-dots" aria-label={`Cleared ${rung.cleared} of 3`}>
                  {[0, 1, 2].map(k => (
                    <span key={k} className={`wm-dot${k < rung.cleared ? ' wm-dot--on' : ''}`} />
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
