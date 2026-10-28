import { useState, useRef, useEffect } from 'react'
import ModelSelector from '../ModelSelector'
import { CAP_CHAT } from '../../utils/capabilities'
import { streamChat } from '../../utils/api'
import { CHAT_MODES, OPENER_EXAMPLE } from './data'

const TONE_CLASS = { coral: 'wm-tag--coral', teal: 'wm-tag--teal', gold: 'wm-tag--gold' }

// Reads an OpenAI-style SSE body and reports the accumulated text as it grows.
async function readStream(body, onText) {
  const reader = body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''
  let text = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += value
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.startsWith('data: ') || line === 'data: [DONE]') continue
      try {
        const delta = JSON.parse(line.slice(6))?.choices?.[0]?.delta?.content
        if (delta) {
          text += delta
          onText(text)
        }
      } catch (_) { /* partial or non-JSON keep-alive line */ }
    }
  }
  return text
}

export default function WingmanChat() {
  const [mode, setMode] = useState(0)
  const [model, setModel] = useState('')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => () => abortRef.current?.abort(), [])

  useEffect(() => {
    // Leave the seeded example at the top until the user has said something.
    const el = scrollRef.current
    if (el && messages.length > 0) el.scrollTop = el.scrollHeight
  }, [messages])

  const pickMode = (i) => {
    if (i === mode) return
    abortRef.current?.abort()
    setMode(i)
    setMessages([])
    setError(null)
  }

  const send = async (e) => {
    e.preventDefault()
    const content = input.trim()
    if (!content || streaming) return
    if (!model) {
      setError('Install or select a chat model first so Wingman has something to think with.')
      return
    }

    const history = [...messages, { role: 'user', content }]
    setMessages([...history, { role: 'assistant', content: '' }])
    setInput('')
    setError(null)
    setStreaming(true)

    const controller = new AbortController()
    abortRef.current = controller
    try {
      const body = await streamChat({
        model,
        messages: [{ role: 'system', content: CHAT_MODES[mode].system }, ...history],
      }, controller.signal)
      await readStream(body, (text) => {
        setMessages(prev => [...prev.slice(0, -1), { role: 'assistant', content: text }])
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message)
        // Drop the empty placeholder so the failed turn doesn't linger.
        setMessages(prev => (prev.at(-1)?.content ? prev : prev.slice(0, -1)))
      }
    } finally {
      setStreaming(false)
    }
  }

  const showExample = mode === 0 && messages.length === 0

  return (
    <>
      <header className="wm-chat-header">
        <div className="wm-row-center wm-gap-12">
          <div className="wm-bot-avatar wm-bot-avatar--lg" aria-hidden="true"><i className="fas fa-comment" /></div>
          <div className="wm-stack-2">
            <h1 className="wm-display wm-title-sm">Wingman</h1>
            <span className="wm-muted wm-text-xs">Knows your ladder, your week and your wins</span>
          </div>
        </div>
        <div className="wm-modes" role="group" aria-label="Wingman mode">
          {CHAT_MODES.map((m, i) => (
            <button
              key={m.label}
              type="button"
              className={`wm-chip${mode === i ? ' wm-chip--on' : ''}`}
              aria-pressed={mode === i}
              onClick={() => pickMode(i)}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="wm-model">
          <span className="wm-muted wm-text-xs">Model</span>
          <ModelSelector value={model} onChange={setModel} capability={CAP_CHAT} className="wm-model__select" />
        </div>
      </header>

      <div className="wm-chat-log" ref={scrollRef} aria-live="polite">
        <div className="wm-bubble wm-bubble--bot wm-bubble--left">{CHAT_MODES[mode].greeting}</div>

        {showExample && (
          <>
            <div className="wm-bubble wm-bubble--me">{OPENER_EXAMPLE.prompt}</div>
            <div className="wm-stack-10">
              <span className="wm-muted wm-text-sm">{OPENER_EXAMPLE.intro}</span>
              {OPENER_EXAMPLE.openers.map(o => (
                <div key={o.tone} className="wm-card wm-card--opener wm-stack-8">
                  <span className={`wm-tag ${TONE_CLASS[o.variant]}`}>{o.tone}</span>
                  <span className="wm-text-base wm-leading">{o.text}</span>
                </div>
              ))}
              <div className="wm-note">
                <i className="fas fa-lightbulb wm-teal-text" aria-hidden="true" />
                <span>{OPENER_EXAMPLE.why}</span>
              </div>
            </div>
          </>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`wm-bubble ${m.role === 'user' ? 'wm-bubble--me' : 'wm-bubble--bot wm-bubble--left'}`}>
            {m.content || <span className="wm-muted">Thinking…</span>}
          </div>
        ))}

        {error && <div className="wm-error" role="alert">{error}</div>}
      </div>

      <form className="wm-composer" onSubmit={send}>
        <label htmlFor="wm-input" className="wm-sr-only">Message Wingman</label>
        <input
          id="wm-input"
          type="text"
          className="wm-input"
          placeholder="Paste a profile, or ask anything"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="wm-send" aria-label="Send" disabled={streaming || !input.trim()}>
          <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </form>
    </>
  )
}
