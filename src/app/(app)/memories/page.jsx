'use client'

import { useState, useMemo } from 'react'
import { useMemoryStore } from '@/stores'
import { MemoryCard } from '@/components/memory/MemoryCard'
import { useDebounce } from '@/hooks'
import { Search, Download, Plus } from 'lucide-react'

const TYPES = ['all', 'thought', 'note', 'goal', 'event', 'voice', 'journal', 'research']

export default function MemoriesPage() {
  const memories = useMemoryStore((s) => s.memories)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const debouncedQuery = useDebounce(query, 200)

  const filtered = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim()
    return memories
      .filter((m) => {
        const okType = typeFilter === 'all' || m.type === typeFilter
        const okQuery =
          !q ||
          (m.content || '').toLowerCase().includes(q) ||
          (m.title || '').toLowerCase().includes(q) ||
          (m.tags || []).some((t) => t.toLowerCase().includes(q))
        return okType && okQuery
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }, [memories, debouncedQuery, typeFilter])

  function exportCSV() {
    const header = 'type,title,content,tags,created_at\n'
    const rows = memories
      .map(
        (m) =>
          `"${m.type}","${(m.title || '').replace(/"/g, '""')}","${(m.content || '').replace(/"/g, '""')}","${(m.tags || []).join(', ')}","${m.created_at}"`
      )
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `memora-export-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const countLabel =
    filtered.length +
    ' ' +
    (typeFilter === 'all' ? 'memories' : typeFilter + 's') +
    (debouncedQuery ? ` matching "${debouncedQuery}"` : '')

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-5xl mx-auto">
        {/* Search */}
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl mb-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <Search size={14} style={{ color: 'var(--text-tertiary)', opacity: 0.6 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search memories..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Type filters */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize cursor-pointer"
              style={{
                background: typeFilter === t ? 'rgba(91,71,224,0.1)' : 'var(--bg-muted)',
                color: typeFilter === t ? 'var(--color-brand)' : 'var(--text-secondary)',
                border: `1px solid ${typeFilter === t ? 'rgba(91,71,224,0.25)' : 'var(--border-default)'}`,
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
            {countLabel}
          </span>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            >
              <Download size={12} /> Export
            </button>
            <button
              onClick={() => (window.location.href = '/dashboard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
              style={{ background: 'var(--color-brand)' }}
            >
              <Plus size={12} /> New
            </button>
          </div>
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((m) => (
              <MemoryCard key={m.id} memory={m} highlight={debouncedQuery} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-base font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
              Nothing found
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Try a different search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
