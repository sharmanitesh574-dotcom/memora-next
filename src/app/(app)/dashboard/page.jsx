'use client'

import { useEffect, useState } from 'react'
import { useMemoryStore, useUserStore } from '@/stores'
import { useGreeting } from '@/hooks'
import { api } from '@/lib/api'
import { QuickCapture } from '@/components/capture/QuickCapture'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { ActionItems } from '@/components/insights/ActionItems'

export default function DashboardPage() {
  const user = useUserStore((s) => s.user)
  const memories = useMemoryStore((s) => s.memories)
  const getRecent = useMemoryStore((s) => s.getRecent)
  const getStats = useMemoryStore((s) => s.getStats)
  const greeting = useGreeting(user?.name)
  const [focus, setFocus] = useState(null)

  useEffect(() => {
    if (memories.length >= 2) {
      api.get('/intelligence/focus')
        .then((d) => { if (d.daily_focus) setFocus(d.daily_focus) })
        .catch(() => {})
    }
  }, [memories.length])

  const recent = getRecent(8)
  const stats = getStats()

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-4xl mx-auto">
        {/* Greeting */}
        <div className="flex items-start justify-between mb-5 gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              {greeting} ✦
            </h1>
            <p className="text-xs mt-1 uppercase font-medium tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <span
            className="text-xs font-medium px-2.5 py-1 rounded-md cursor-pointer shrink-0 transition-colors"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
          >
            {stats.total} {stats.total === 1 ? 'memory' : 'memories'}
          </span>
        </div>

        {/* Today's focus */}
        {focus && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-5 cursor-pointer transition-colors"
            style={{
              background: 'var(--color-brand-light)',
              border: '1px solid rgba(91,71,224,0.12)',
              color: 'var(--color-brand)',
            }}
          >
            <span className="text-sm shrink-0">◎</span>
            <span className="text-sm font-medium truncate">{focus}</span>
          </div>
        )}

        {/* Quick capture */}
        <QuickCapture />

        {/* Action items */}
        <ActionItems />

        {/* Recent memories */}
        <div className="flex items-center justify-between mb-4 mt-2">
          <h2
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-tertiary)' }}
          >
            Recent memories
          </h2>
        </div>

        {recent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recent.map((m) => (
              <MemoryCard key={m.id} memory={m} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              No memories yet
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Add your first thought, goal, or note above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
