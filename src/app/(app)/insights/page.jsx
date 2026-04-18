'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useMemoryStore } from '@/stores'
import { RefreshCw, Lightbulb, TrendingUp, Heart, GitBranch } from 'lucide-react'

const TYPE_STYLES = {
  pattern: { icon: TrendingUp, bg: 'rgba(91,71,224,0.08)', color: 'var(--color-brand)', label: 'Pattern' },
  emotional: { icon: Heart, bg: 'rgba(209,78,107,0.08)', color: 'var(--color-coral)', label: 'Emotional' },
  decision: { icon: GitBranch, bg: 'rgba(196,127,23,0.08)', color: 'var(--color-amber)', label: 'Decision' },
}

export default function InsightsPage() {
  const memCount = useMemoryStore((s) => s.memories.length)
  const [insights, setInsights] = useState([])
  const [digest, setDigest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [execSteps, setExecSteps] = useState({})

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    setLoading(true)
    await Promise.all([loadDigest(), loadInsights()])
    setLoading(false)
  }

  async function loadDigest() {
    try {
      const d = await api.get('/intelligence/digest')
      if (d.digest) setDigest(d)
    } catch {}
  }

  async function loadInsights() {
    try {
      const d = await api.get('/intelligence/insights')
      setInsights(d.insights || [])
    } catch {}
  }

  async function markSeen(id) {
    try {
      await api.post(`/intelligence/insights/${id}/seen`, {})
      setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, seen: true } : i)))
    } catch {}
  }

  async function executeInsight(id, goal) {
    setExecSteps((prev) => ({ ...prev, [id]: { loading: true } }))
    try {
      const d = await api.post('/intelligence/execute', { goal })
      setExecSteps((prev) => ({ ...prev, [id]: { steps: d.steps || [], loading: false } }))
    } catch {
      setExecSteps((prev) => ({ ...prev, [id]: { loading: false } }))
    }
  }

  if (memCount < 3) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">🔮</div>
          <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Need more memories</h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add at least 3 to unlock AI insights.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>AI Insights</h1>
          <button
            onClick={loadAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
            style={{ color: 'var(--text-secondary)' }}
          >
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loading && (
          <div className="py-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Analysing your memories...
          </div>
        )}

        {/* Digest */}
        {digest && (
          <div
            className="rounded-xl p-5 mb-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
              Weekly digest
            </p>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-primary)' }}>
              {digest.digest}
            </p>
            {digest.patterns && (
              <p className="text-xs leading-relaxed italic" style={{ color: 'var(--color-brand)' }}>
                {digest.patterns}
              </p>
            )}
            {digest.nudge && (
              <div
                className="mt-3 px-3 py-2 rounded-lg text-xs"
                style={{ background: 'rgba(22,163,122,0.08)', color: 'var(--color-emerald)' }}
              >
                💡 {digest.nudge}
              </div>
            )}
          </div>
        )}

        {/* Insights */}
        {!loading && !insights.length && (
          <div className="text-center py-12">
            <Lightbulb size={32} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No insights yet</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add more memories — patterns emerge over time.</p>
          </div>
        )}

        <div className="space-y-3">
          {insights.map((ins) => {
            const style = TYPE_STYLES[ins.type] || TYPE_STYLES.pattern
            const Icon = style.icon
            const exec = execSteps[ins.id]

            return (
              <div
                key={ins.id}
                onClick={() => markSeen(ins.id)}
                className="rounded-xl p-5 cursor-pointer transition-all hover:-translate-y-0.5"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: style.bg, color: style.color }}
                  >
                    <Icon size={11} /> {style.label}
                  </span>
                  {!ins.seen && (
                    <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded text-white" style={{ background: 'var(--color-brand)' }}>
                      New
                    </span>
                  )}
                </div>
                <h4 className="text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>{ins.title}</h4>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{ins.body}</p>

                {/* Execute */}
                <div className="mt-3">
                  {!exec?.steps && (
                    <button
                      onClick={(e) => { e.stopPropagation(); executeInsight(ins.id, ins.body.slice(0, 100)) }}
                      disabled={exec?.loading}
                      className="text-xs px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                      style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                    >
                      {exec?.loading ? 'Loading...' : 'How do I act on this? →'}
                    </button>
                  )}
                  {exec?.steps && (
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      {exec.steps.map((s, i) => (
                        <li key={i} className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s}</li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
