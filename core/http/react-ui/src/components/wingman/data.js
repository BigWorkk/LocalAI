// Static game content for the Wingman page. Progress (XP, quests ticked)
// lives in useWingmanProgress; everything here is the fixed "level design".

export const WINGMAN_BASE = '/app/wingman'

export const LEVELS = [0, 300, 650, 1000, 1500, 2100, 2800, 3600]
export const RANKS = ['Rookie', 'Warm-Up', 'The Opener', 'The Regular', 'The Asker', 'Real Ask', 'Date Night', 'Player Two']

export function levelFor(xp) {
  let lvl = 0
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]) lvl = i
  }
  const start = LEVELS[lvl]
  // Past the last threshold the bar keeps filling in 1000 XP steps so the
  // UI never shows a full or divide-by-zero bar.
  const next = LEVELS[lvl + 1] != null ? LEVELS[lvl + 1] : start + 1000
  return {
    level: lvl + 1,
    rank: RANKS[lvl],
    toNext: next - xp,
    pct: Math.min(100, Math.round(((xp - start) / (next - start)) * 100)),
  }
}

export const RUNGS = [
  { name: 'Warm-Up', desc: 'Small talk with a cashier, barista or gym regular', xp: 5, cleared: 3 },
  { name: 'The Opener', desc: 'Ask a stranger a real question', xp: 10, cleared: 2 },
  { name: 'The Lingerer', desc: 'Keep a conversation going 3+ minutes', xp: 15, cleared: 0 },
  { name: 'The Regular', desc: 'Learn a name at your weekly activity, use it next time', xp: 20, cleared: 0 },
  { name: 'The Ask', desc: 'Invite someone to a group hang or post-ride food', xp: 30, cleared: 0 },
  { name: 'The Real Ask', desc: 'Ask a woman you like out for coffee', xp: 50, cleared: 0 },
  { name: 'Date Night', desc: 'Go on the date', xp: 75, cleared: 0 },
  { name: 'Second Date', desc: 'Get a yes to a second date', xp: 100, cleared: 0 },
]
export const CURRENT_RUNG = 1

export const QUESTS = [
  { title: 'Weekly quest: group ride', meta: 'Tue · 1.5 hrs · same time every week', xp: 20 },
  { title: 'Hinge, 10 minutes a day', meta: '3 thoughtful likes · reply to messages', xp: 15 },
  { title: 'Two ladder reps', meta: 'During normal errands · no extra time', xp: 20 },
  { title: 'A date or a side quest', meta: 'Weekend · coffee, walk or festival', xp: 30 },
  { title: 'Sunday check-in', meta: '5 minutes · log XP, rate your week', xp: 10 },
]

export const RADAR = [
  { name: '[Group ride name]', when: 'Tue 6:00 PM' },
  { name: '[Trivia night venue]', when: 'Wed 7:00 PM' },
  { name: '[Run club name]', when: 'Thu 6:30 PM' },
]

export const STATS = [
  { name: 'Social confidence', cur: 4, goal: 7 },
  { name: 'New people per week', cur: 3, goal: 5 },
  { name: 'Profile power', cur: 5, goal: 8 },
  { name: 'Conversation skill', cur: 5, goal: 7 },
  { name: 'Showing up', cur: 6, goal: 8 },
]

export const BADGES = [
  { name: 'First Contact', unlock: 'Clear rung 1 three times', earned: true },
  { name: 'Glow Up', unlock: 'Finish your 6-photo Hinge profile', earned: true },
  { name: 'Regular', unlock: 'Show up 4 weeks in a row', earned: false },
  { name: 'Shot Taker', unlock: "Ask someone out. Result doesn't matter", earned: false },
  { name: 'Coffee Run', unlock: 'Go on your first date', earned: false },
  { name: 'Streak', unlock: '3 dates in one month', earned: false },
  { name: 'Player Two Found', unlock: "A second date you're excited about", earned: false },
]

export const LOOT = [
  { label: '[Your reward] · new riding gear', progress: '7 / 10 reps', pct: 70 },
  { label: '[Your reward] · after your first date', progress: 'Locked', pct: 0 },
]

export const CHAT_MODES = [
  {
    label: 'Opener Lab',
    greeting: "Paste her Hinge profile or a prompt she answered. I'll give you three openers that only work on her.",
    system: 'You are Wingman, a warm, practical dating-confidence coach. The user pastes a dating profile or prompt. Reply with exactly three short openers labelled Playful, Curious and Direct. Each must reference a specific detail from the profile and end on an easy question. Then one sentence on why they work. No pickup-artist tactics, no manipulation.',
  },
  {
    label: 'Pep Talk',
    greeting: "Nervous about something coming up? Tell me what it is and I'll get you out the door.",
    system: 'You are Wingman, a warm, grounded confidence coach. Give a short pep talk (under 120 words) that names the fear, shrinks the task to one small step, and reminds the user that trying earns XP regardless of the outcome. No toxic positivity.',
  },
  {
    label: 'Date Planner',
    greeting: "Tell me who it's with, what she's into and your budget. I'll plan something low-pressure.",
    system: 'You are Wingman, a practical date planner. Suggest two low-pressure first-date ideas that fit the details given, each with a one-line reason and a simple way to ask. Keep it short and concrete.',
  },
  {
    label: 'Profile Fix',
    greeting: "Paste your profile prompts. I'll tell you what's working and rewrite the weakest one.",
    system: 'You are Wingman, an honest dating-profile editor. Name what works in the user\'s profile, point out the weakest prompt and rewrite it to be specific and easy to reply to. Be kind and direct.',
  },
]

// The Opener Lab example from the design, shown until the user sends a
// message of their own so the screen never starts empty.
export const OPENER_EXAMPLE = {
  prompt: 'Her prompt: "Green flags: will split boudin balls with me and go on a sunrise run."',
  intro: 'Three angles. Pick the one that sounds like you.',
  openers: [
    { tone: 'Playful', variant: 'coral', text: "Splitting boudin balls is the easy part. The sunrise run is where you find out who's serious. What pace are we talking?" },
    { tone: 'Curious', variant: 'teal', text: "Okay, where's your go-to spot for boudin balls? This feels like a trust exercise." },
    { tone: 'Direct', variant: 'gold', text: "Sunrise run first, boudin balls as the reward. I'm in if you are. What's your usual route?" },
  ],
  why: 'Why these work: each one grabs her exact detail and ends on an easy question she wants to answer.',
}
