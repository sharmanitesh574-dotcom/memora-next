'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { api } from '@/lib/api'
import { useUserStore } from '@/stores'
import { Plus, Send, MessageCircle } from 'lucide-react'

const MODELS = [
  { id: 'o3-mini', label: 'Fast', desc: 'Quick answers' },
  { id: 'gpt-4o', label: 'Smart', desc: 'Deep thinking' },
]

const HINTS = [
  'Summarise my recent memories',
  'What patterns do you see in my notes?',
  'Help me reflect on my goals',
  "What should I focus on today?",
  'What decisions am I stuck on?',
]

export default function ChatPage() {
  const [sessions, setSessions] = useState([])
  const [activeSession, setActiveSession] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [model, setModel] = useState('o3-mini')
  const [isStreaming, setIsStreaming] = useState(false)
  const [limitHit, setLimitHit] = useState(false)
  const plan = useUserStore((s) => s.plan)
  const bodyRef = useRef(null)
  const inputRef = useRef(null)

  // Load sessions on mount
  useEffect(() => {
    api.get('/ai/sessions').then((d) => {
      const s = d.sessions || []
      setSessions(s)
      if (s.length && s[0]) loadSession(s[0].id)
    }).catch(() => {})
  }, [])

  function scrollToBottom() {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }

  async function loadSession(id) {
    setActiveSession(id)
    try {
      const d = await api.get(`/ai/sessions/${id}/messages`)
      setMessages((d.messages || []).map((m) => ({ role: m.role, content: m.content })))
      setTimeout(scrollToBottom, 50)
    } catch {}
  }

  async function createNewChat() {
    try {
      const d = await api.post('/ai/sessions', { title: 'New chat' })
      const newSession = d.session
      setSessions((prev) => [newSession, ...prev])
      setActiveSession(newSession.id)
      setMessages([])
    } catch {}
  }

  const sendMessage = useCallback(async (text) => {
    const msg = text || input.trim()
    if (!msg || isStreaming) return

    // Check free tier limit
    if (plan && plan.plan !== 'pro' && plan.usage?.chats_today >= 5) {
      setLimitHit(true)
      return
    }

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setIsStreaming(true)

    // Add empty AI message that we'll stream into
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
    setTimeout(scrollToBottom, 50)

    try {
      const token = localStorage.getItem('mt')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ''
      const res = await fetch(`${apiUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: msg,
          sessionId: activeSession,
          model,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.code === 'LIMIT_CHATS') {
          setLimitHit(true)
          setMessages((prev) => prev.slice(0, -1)) // remove empty AI msg
          setIsStreaming(false)
          return
        }
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: err.error || 'Something went wrong.' }
          return updated
        })
        setIsStreaming(false)
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          try {
            const d = JSON.parse(line.slice(6))
            if (d.sessionId && d.sessionId !== activeSession) {
              setActiveSession(d.sessionId)
              const shortTitle = msg.slice(0, 40)
              setSessions((prev) => {
                if (prev.find((s) => s.id === d.sessionId)) return prev
                return [{ id: d.sessionId, title: shortTitle }, ...prev]
              })
            }
            if (d.content) {
              full += d.content
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = { role: 'assistant', content: full }
                return updated
              })
              scrollToBottom()
            }
            if (d.done) break
          } catch {}
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: 'Connection error — please try again.' }
        return updated
      })
    }

    setIsStreaming(false)
    scrollToBottom()
  }, [input, isStreaming, activeSession, model, plan])

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Simple markdown: **bold**, `code`, newlines
  function renderMarkdown(text) {
    if (!text) return ''
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`(.+?)`/g, '<code style="background:var(--bg-muted);padding:1px 4px;border-radius:3px;font-size:12px;font-family:var(--font-mono)">$1</code>')
      .replace(/\n/g, '<br/>')
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Top bar: model selector + sessions + new chat */}
      <div
        className="flex items-center gap-3 px-5 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        {/* Model selector */}
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'var(--bg-muted)' }}>
          {MODELS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className="px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer"
              style={{
                background: model === m.id ? 'var(--bg-surface)' : 'transparent',
                color: model === m.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                boxShadow: model === m.id ? 'var(--shadow-sm)' : 'none',
              }}
              title={m.desc}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Session tabs */}
        <div className="flex gap-1 flex-1 overflow-x-auto min-w-0">
          {sessions.slice(0, 5).map((s) => (
            <button
              key={s.id}
              onClick={() => loadSession(s.id)}
              className="px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-all cursor-pointer shrink-0"
              style={{
                background: s.id === activeSession ? 'rgba(91,71,224,0.1)' : 'transparent',
                color: s.id === activeSession ? 'var(--color-brand)' : 'var(--text-tertiary)',
                fontWeight: s.id === activeSession ? 500 : 400,
              }}
            >
              {(s.title || 'Chat').slice(0, 18)}
            </button>
          ))}
        </div>

        <button
          onClick={createNewChat}
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
          title="New chat"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* Chat body */}
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-5 py-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--bg-muted)' }}
            >
              <MessageCircle size={24} style={{ color: 'var(--text-tertiary)' }} />
            </div>
            <h3 className="font-display text-lg font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
              Ask me anything
            </h3>
            <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-secondary)' }}>
              I have full context of your memories, goals and patterns.
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md">
              {HINTS.map((h) => (
                <button
                  key={h}
                  onClick={() => sendMessage(h)}
                  className="px-3 py-1.5 rounded-full text-xs cursor-pointer transition-colors"
                  style={{
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-5">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-medium text-white italic mt-0.5"
                    style={{ background: 'var(--color-brand)', fontFamily: 'Georgia, serif' }}
                  >
                    M
                  </div>
                )}
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                  style={{
                    background: msg.role === 'user' ? 'var(--color-brand)' : 'var(--bg-surface)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-default)',
                  }}
                >
                  {msg.role === 'user' ? (
                    <p>{msg.content}</p>
                  ) : msg.content ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                  ) : (
                    <div className="flex gap-1.5 py-1">
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full animate-bounce" style={{ background: 'var(--text-tertiary)', animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat limit warning */}
      {limitHit && (
        <div className="px-5 py-2 text-center text-xs" style={{ color: 'var(--color-amber)', background: 'var(--bg-muted)' }}>
          Daily chat limit reached (5/day on free).{' '}
          <a href="/billing" style={{ color: 'var(--color-brand)', fontWeight: 500 }}>
            Upgrade to Pro →
          </a>
        </div>
      )}

      {/* Input bar */}
      <div className="px-5 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-default)' }}>
        <div
          className="flex items-end gap-2 max-w-2xl mx-auto rounded-xl px-4 py-2"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.target.style.height = '34px'
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your memories, brainstorm, plan..."
            className="flex-1 bg-transparent border-none outline-none text-sm resize-none leading-relaxed"
            style={{ color: 'var(--text-primary)', minHeight: '34px', maxHeight: '120px' }}
            rows={1}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isStreaming || !input.trim()}
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white disabled:opacity-30 cursor-pointer transition-colors"
            style={{ background: 'var(--color-brand)' }}
          >
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
