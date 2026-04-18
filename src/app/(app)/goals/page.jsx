'use client'

import { useMemo } from 'react'
import { useMemoryStore, useUIStore } from '@/stores'
import { api } from '@/lib/api'
import { Target, Zap, Check } from 'lucide-react'

export default function GoalsPage() {
  const memories = useMemoryStore((s) => s.memories)
  const openDrawer = useUIStore((s) => s.openDrawer)

  const { active, actions, done } = useMemo(() => {
    const goals = memories.filter((m) => m.type === 'goal')
    const acts = memories.filter((m) => m.action_item && !m.action_done)
    return {
      active: goals.filter((m) => m.memory_stage === 'active' || !m.memory_stage),
      actions: acts,
      done: goals.filter((m) => m.memory_stage === 'done'),
    }
  }, [memories])

  async function markDone(id, e) {
    e.stopPropagation()
    try {
      await api.post(`/intelligence/actions/${id}/done`, {})
      useMemoryStore.getState().fetchMemories()
    } catch {}
  }

  function DueLabel({ due }) {
    if (!due) return null
    const d = new Date(due)
    const diff = d - new Date()
    const isOverdue = diff < 0
    const isSoon = diff < 3 * 86400000
    return (
      <span
        className="text-[10px] font-medium mt-1 inline-block"
        style={{ color: isOverdue ? 'var(--color-coral)' : isSoon ? 'var(--color-amber)' : 'var(--color-emerald)' }}
      >
        {isOverdue ? 'Overdue' : 'Due ' + d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
      </span>
    )
  }

  function GoalCard({ m }) {
    return (
      <div
        onClick={() => openDrawer(m.id)}
        className="rounded-xl p-3.5 cursor-pointer transition-all hover:-translate-y-0.5 mb-2.5"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
      >
        <h5 className="text-sm font-semibold mb-1 leading-snug" style={{ color: 'var(--text-primary)' }}>
          {m.title || (m.content || '').slice(0, 50)}
        </h5>
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {(m.content || '').slice(0, 80)}
        </p>
        <DueLabel due={m.action_due} />
      </div>
    )
  }

  function ActionCard({ m }) {
    return (
      <div
        onClick={() => openDrawer(m.id)}
        className="rounded-xl p-3.5 cursor-pointer transition-all hover:-translate-y-0.5 mb-2.5 flex gap-3"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
      >
        <input
          type="checkbox"
          className="mt-0.5 shrink-0"
          style={{ accentColor: 'var(--color-brand)' }}
          onClick={(e) => markDone(m.id, e)}
        />
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-semibold mb-0.5 leading-snug" style={{ color: 'var(--text-primary)' }}>
            {m.action_item}
          </h5>
          <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
            {m.title || (m.content || '').slice(0, 40)}
          </p>
          <DueLabel due={m.action_due} />
        </div>
      </div>
    )
  }

  const isEmpty = !active.length && !actions.length && !done.length

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Goals & actions
          </h1>
          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
            style={{ background: 'var(--color-brand)' }}
          >
            + New goal
          </button>
        </div>

        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>No goals yet</h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Capture a goal to start tracking progress.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Active */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <Target size={13} /> Active ({active.length})
              </h4>
              {active.length ? active.map((m) => <GoalCard key={m.id} m={m} />) : (
                <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>No active goals</p>
              )}
            </div>

            {/* Actions */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <Zap size={13} /> Actions ({actions.length})
              </h4>
              {actions.length ? actions.map((m) => <ActionCard key={m.id} m={m} />) : (
                <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>No pending actions</p>
              )}
            </div>

            {/* Done */}
            <div>
              <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-tertiary)' }}>
                <Check size={13} /> Done ({done.length})
              </h4>
              {done.length ? done.map((m) => <GoalCard key={m.id} m={m} />) : (
                <p className="text-xs py-2" style={{ color: 'var(--text-tertiary)' }}>Nothing completed yet</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
