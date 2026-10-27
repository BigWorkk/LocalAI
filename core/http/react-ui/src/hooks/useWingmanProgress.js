import { useState, useCallback } from 'react'
import { QUESTS } from '../components/wingman/data'

const STORAGE_KEY = 'localai_wingman_progress'

const DEFAULT_PROGRESS = {
  xp: 1240,
  quests: [true, true, true, false, false],
}

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!stored) return DEFAULT_PROGRESS
    return {
      xp: Number.isFinite(stored.xp) ? stored.xp : DEFAULT_PROGRESS.xp,
      quests: Array.isArray(stored.quests) && stored.quests.length === QUESTS.length
        ? stored.quests.map(Boolean)
        : DEFAULT_PROGRESS.quests,
    }
  } catch (_) {
    return DEFAULT_PROGRESS
  }
}

// Progress is a per-browser convenience, so localStorage is enough; the
// page must keep working (with defaults) when storage is unavailable.
export function useWingmanProgress() {
  const [progress, setProgress] = useState(load)

  const update = useCallback((fn) => {
    setProgress(prev => {
      const next = fn(prev)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch (_) { /* ignore */ }
      return next
    })
  }, [])

  const addXp = useCallback((amount) => {
    update(p => ({ ...p, xp: p.xp + amount }))
  }, [update])

  const toggleQuest = useCallback((index) => {
    update(p => ({ ...p, quests: p.quests.map((done, i) => (i === index ? !done : done)) }))
  }, [update])

  return { ...progress, addXp, toggleQuest }
}
