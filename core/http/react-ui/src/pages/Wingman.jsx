import { useParams } from 'react-router-dom'
import { useWingmanProgress } from '../hooks/useWingmanProgress'
import { WingmanTabBar } from '../components/wingman/WingmanTabBar'
import WingmanHome from '../components/wingman/WingmanHome'
import HypeMode from '../components/wingman/HypeMode'
import NervesLadder from '../components/wingman/NervesLadder'
import WingmanChat from '../components/wingman/WingmanChat'
import WeeklyQuests from '../components/wingman/WeeklyQuests'
import PlayerCard from '../components/wingman/PlayerCard'
import Debrief from '../components/wingman/Debrief'
import NotFound from './NotFound'
import './wingman.css'

// Hype Mode and Debrief are single-task flows, so they hide the tab bar.
const FOCUSED = new Set(['hype', 'debrief'])

export default function Wingman() {
  const { screen = 'home' } = useParams()
  const progress = useWingmanProgress()

  let content
  switch (screen) {
    case 'home': content = <WingmanHome {...progress} />; break
    case 'hype': content = <HypeMode />; break
    case 'ladder': content = <NervesLadder />; break
    case 'chat': content = <WingmanChat />; break
    case 'quests': content = <WeeklyQuests {...progress} />; break
    case 'badges': content = <PlayerCard />; break
    case 'debrief': content = <Debrief {...progress} />; break
    default: return <NotFound />
  }

  return (
    <div className={`wingman${screen === 'chat' ? ' wingman--chat' : ''}`}>
      {content}
      {!FOCUSED.has(screen) && <WingmanTabBar />}
    </div>
  )
}
