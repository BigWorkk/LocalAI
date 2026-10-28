import { useState } from 'react'
import { WingmanBackLink } from './WingmanTabBar'

const MOODS = ['Rough', 'Okay', 'Good', 'Great']
const DEBRIEF_XP = 5

export default function Debrief({ addXp }) {
  const [mood, setMood] = useState(2)
  const [before, setBefore] = useState(7)
  const [after, setAfter] = useState(4)
  const [said, setSaid] = useState('')
  const [next, setNext] = useState('')
  const [saved, setSaved] = useState(false)

  const save = (e) => {
    e.preventDefault()
    // XP is banked once per visit; re-pressing must not farm points.
    if (saved) return
    addXp(DEBRIEF_XP)
    setSaved(true)
  }

  return (
    <form className="wm-scroll wm-scroll--focused" onSubmit={save}>
      <WingmanBackLink />

      <header className="wm-stack-6">
        <span className="wm-eyebrow wm-teal-text">Debrief · Rung 2</span>
        <h1 className="wm-display wm-title-lg">30 seconds. Then you're done.</h1>
      </header>

      <fieldset className="wm-stack-10 wm-fieldset">
        <legend className="wm-strong wm-text-base">How'd it go?</legend>
        <div className="wm-grid-4">
          {MOODS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`wm-choice${mood === i ? ' wm-choice--on' : ''}`}
              aria-pressed={mood === i}
              onClick={() => setMood(i)}
            >
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="wm-card wm-card--sm wm-stack-14">
        <div className="wm-stack-6">
          <div className="wm-row-between wm-text-md">
            <label htmlFor="wm-nerves-before" className="wm-strong">Nerves before</label>
            <span className="wm-coral-soft-text wm-strong">{before} / 10</span>
          </div>
          <input id="wm-nerves-before" type="range" min="1" max="10" value={before} onChange={(e) => setBefore(Number(e.target.value))} className="wm-range wm-range--coral" />
        </div>
        <div className="wm-stack-6">
          <div className="wm-row-between wm-text-md">
            <label htmlFor="wm-nerves-after" className="wm-strong">Nerves after</label>
            <span className="wm-teal-text wm-strong">{after} / 10</span>
          </div>
          <input id="wm-nerves-after" type="range" min="1" max="10" value={after} onChange={(e) => setAfter(Number(e.target.value))} className="wm-range wm-range--teal" />
        </div>
      </div>

      <div className="wm-stack-8">
        <label htmlFor="wm-said" className="wm-strong wm-text-base">What did you say first?</label>
        <textarea id="wm-said" rows={2} className="wm-input" placeholder={'"Is this pace always this brutal?"'} value={said} onChange={(e) => setSaid(e.target.value)} />
      </div>

      <div className="wm-stack-8">
        <label htmlFor="wm-next" className="wm-strong wm-text-base">One thing to try next time</label>
        <textarea id="wm-next" rows={2} className="wm-input" placeholder="Ask a follow-up about her answer" value={next} onChange={(e) => setNext(e.target.value)} />
      </div>

      <div className="wm-callout">
        <i className="fas fa-arrow-trend-up" aria-hidden="true" />
        <span>Pattern spotted: your nerves drop about 3 points once you've been somewhere twice. Familiar places are your cheat code. Keep the same ride.</span>
      </div>

      <button type="submit" className="wm-btn wm-btn--primary wm-btn--lg">
        {saved ? `Saved · +${DEBRIEF_XP} XP banked` : `Save debrief · +${DEBRIEF_XP} XP`}
      </button>
    </form>
  )
}
