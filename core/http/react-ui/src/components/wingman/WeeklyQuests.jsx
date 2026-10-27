import { QUESTS, RADAR } from './data'

export default function WeeklyQuests({ quests, toggleQuest }) {
  const doneCount = quests.filter(Boolean).length

  return (
    <div className="wm-scroll">
      <header className="wm-row-between wm-row-end">
        <div className="wm-stack-4">
          <span className="wm-muted wm-text-sm">Act 2: Reps · Week 3 of 13</span>
          <h1 className="wm-display wm-title-lg">This week</h1>
        </div>
        <span className="wm-teal-text wm-text-md wm-strong">{doneCount} of {QUESTS.length} done</span>
      </header>

      <section className="wm-boss wm-stack-10">
        <div className="wm-row-between wm-row-center">
          <span className="wm-eyebrow wm-coral-soft-text">Weekly boss</span>
          <span className="wm-gold-text wm-text-sm wm-bold">40 XP</span>
        </div>
        <span className="wm-display wm-title-md">Learn two names at the group ride. Use them next week.</span>
        <div className="wm-row-center wm-gap-10">
          <div className="wm-meter wm-meter--boss wm-grow"><div className="wm-meter__fill" style={{ width: '50%' }} /></div>
          <span className="wm-text-sm wm-boss__count">1 of 2</span>
        </div>
      </section>

      <section className="wm-stack-8">
        <span className="wm-strong wm-text-base">The loop · about 3.5 hours</span>
        {QUESTS.map((q, i) => (
          <button
            key={q.title}
            type="button"
            className="wm-quest"
            aria-pressed={quests[i]}
            onClick={() => toggleQuest(i)}
          >
            <span className={`wm-check${quests[i] ? ' wm-check--on' : ''}`} aria-hidden="true">
              {quests[i] && <i className="fas fa-check" />}
            </span>
            <span className="wm-quest__text">
              <span className="wm-strong wm-text-base">{q.title}</span>
              <span className="wm-muted wm-text-xs">{q.meta}</span>
            </span>
            <span className="wm-gold-text wm-text-sm wm-strong">+{q.xp}</span>
          </button>
        ))}
      </section>

      <section className="wm-stack-8">
        <div className="wm-row-center wm-gap-8">
          <i className="fas fa-bullseye wm-teal-text" aria-hidden="true" />
          <span className="wm-strong wm-text-base">Wingman Radar · near you</span>
        </div>
        <ul className="wm-list">
          {RADAR.map(r => (
            <li key={r.name} className="wm-row-between">
              <span className="wm-text-md">{r.name}</span>
              <span className="wm-muted wm-text-sm">{r.when}</span>
            </li>
          ))}
        </ul>
        <span className="wm-muted wm-text-xs">Wingman fills these from real Baton Rouge listings each Sunday.</span>
      </section>
    </div>
  )
}
