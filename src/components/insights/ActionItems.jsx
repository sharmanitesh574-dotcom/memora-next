'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

export function ActionItems() {
  const [actions, setActions] = useState([])

  useEffect(() => {
    api.get('/intelligence/actions')
      .then((d) => setActions(d.actions || []))
      .catch(() => {})
  }, [])

  if (!actions.length) return null

  async function markDone(id) {
    try {
      await api.post(`/intelligence/actions/${id}/done`, {})
      setActions((prev) => prev.filter((a) => a.id !== id))
    } catch {}
  }

  return (
    <div
      className="rounded-xl px-4 py-3 mb-5"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
          Action items
        </h3>
      </div>
      {actions.slice(0, 4).map((a) => (
        <div key={a.id} className="flex items-start gap-2.5 py-2" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <input
            type="checkbox"
            className="mt-0.5 accent-[var(--color-brand)]"
            onChange={() => markDone(a.id)}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{a.action_item}</p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
              {a.title || (a.content || '').slice(0, 40)}
            </p>
          </div>
          {a.action_due && (
            <span className="text-[10px] font-medium shrink-0" style={{ color: 'var(--color-amber)' }}>
              {new Date(a.action_due).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
