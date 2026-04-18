'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useUIStore } from '@/stores'
import { Clock } from 'lucide-react'

export function ThisDay() {
  const [memories, setMemories] = useState([])
  const openDrawer = useUIStore((s) => s.openDrawer)

  useEffect(() => {
    api.get('/intelligence/this-day')
      .then((d) => setMemories(d.memories || []))
      .catch(() => {})
  }, [])

  if (!memories.length) return null

  return (
    <div className="mb-5">
      <h3
        className="text-xs font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5"
        style={{ color: 'var(--text-tertiary)' }}
      >
        <Clock size={11} /> Looking back
      </h3>
      <div className="space-y-2">
        {memories.slice(0, 3).map((m) => (
          <div
            key={m.id}
            onClick={() => openDrawer(m.id)}
            className="flex items-start gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all hover:-translate-y-0.5"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-base"
              style={{ background: 'rgba(196,127,23,0.08)' }}
            >
              {m.time_label === '1 year ago' ? '📅' : m.time_label === '3 months ago' ? '🗓️' : '🕐'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-amber)' }}
                >
                  {m.time_label}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded capitalize"
                  style={{ background: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}
                >
                  {m.type}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug mb-0.5" style={{ color: 'var(--text-primary)' }}>
                {m.title || (m.content || '').slice(0, 60)}
              </p>
              {m.reflection && (
                <p className="text-xs italic line-clamp-1" style={{ color: 'var(--color-brand)', opacity: 0.7 }}>
                  {m.reflection}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
