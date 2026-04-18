'use client'

import { useMemo } from 'react'
import { useMemoryStore } from '@/stores'
import { MemoryCard } from '@/components/memory/MemoryCard'

export default function TimelinePage() {
  const memories = useMemoryStore((s) => s.memories)

  const grouped = useMemo(() => {
    const sorted = [...memories].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    const byMonth = {}
    sorted.forEach((m) => {
      const key = new Date(m.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
      if (!byMonth[key]) byMonth[key] = []
      byMonth[key].push(m)
    })
    return Object.entries(byMonth)
  }, [memories])

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-display text-xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
          Your story, chronologically
        </h1>
        <p className="text-xs mb-6" style={{ color: 'var(--text-tertiary)' }}>
          {memories.length} memories across your journey
        </p>

        {!memories.length ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">📖</div>
            <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>Your story starts here</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Add memories to build your personal timeline.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map(([month, mems]) => (
              <div key={month}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--color-brand)' }} />
                  <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {month}
                    <span className="font-normal ml-2" style={{ color: 'var(--text-tertiary)' }}>
                      — {mems.length} {mems.length === 1 ? 'memory' : 'memories'}
                    </span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ml-5 pl-4" style={{ borderLeft: '1px solid var(--border-default)' }}>
                  {mems.map((m) => (
                    <MemoryCard key={m.id} memory={m} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
