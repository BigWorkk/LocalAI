import { NavLink, Link } from 'react-router-dom'
import { WINGMAN_BASE } from './data'

const TABS = [
  { path: WINGMAN_BASE, icon: 'fas fa-house', label: 'Home', end: true },
  { path: `${WINGMAN_BASE}/ladder`, icon: 'fas fa-stairs', label: 'Ladder' },
  { path: `${WINGMAN_BASE}/chat`, icon: 'fas fa-comment', label: 'Wingman' },
  { path: `${WINGMAN_BASE}/quests`, icon: 'fas fa-flag', label: 'Quests' },
  { path: `${WINGMAN_BASE}/badges`, icon: 'fas fa-trophy', label: 'Badges' },
]

export function WingmanTabBar() {
  return (
    <nav className="wm-tabbar" aria-label="Wingman">
      {TABS.map(tab => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end={tab.end}
          className={({ isActive }) => `wm-tab${isActive ? ' wm-tab--active' : ''}`}
        >
          <i className={tab.icon} aria-hidden="true" />
          <span>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

// Focused flows (Hype Mode, Debrief) swap the tab bar for a way home.
export function WingmanBackLink() {
  return (
    <Link to={WINGMAN_BASE} className="wm-back">
      <i className="fas fa-chevron-left" aria-hidden="true" />
      <span>Home</span>
    </Link>
  )
}
