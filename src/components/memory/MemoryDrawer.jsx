'use client'

import { useUIStore, useMemoryStore } from '@/stores'

export function MemoryDrawer() {
  const memoryId = useUIStore((s) => s.drawerMemoryId)
  const close = useUIStore((s) => s.closeDrawer)
  const memories = useMemoryStore((s) => s.memories)

  if (!memoryId) return null
  const memory = memories.find((m) => m.id === memoryId)
  if (!memory) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[400]" onClick={close} />
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[460px] z-[401] flex flex-col overflow-hidden"
        style={{
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <h2 className="font-display text-base font-bold tracking-tight">{memory.title || 'Memory'}</h2>
          <button
            onClick={close}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm cursor-pointer"
            style={{ border: '1px solid var(--border-hover)', color: 'var(--text-secondary)' }}
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* TODO: Full memory editor with type, tags, content, reflection, connections */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{memory.content}</p>
          {memory.reflection && (
            <div className="mt-4 px-3 py-2.5 rounded-xl" style={{ background: 'var(--color-brand-light)' }}>
              <p className="text-[8px] font-semibold uppercase tracking-wider mb-1 opacity-70" style={{ color: 'var(--color-brand)' }}>AI reflection</p>
              <p className="font-serif text-sm italic leading-relaxed" style={{ color: 'var(--color-brand)' }}>{memory.reflection}</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
