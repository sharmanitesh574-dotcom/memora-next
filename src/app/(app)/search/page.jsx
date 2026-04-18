'use client'

import { useState } from 'react'
import { api } from '@/lib/api'
import { Search as SearchIcon, Globe, ExternalLink } from 'lucide-react'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [answer, setAnswer] = useState(null)
  const [searching, setSearching] = useState(false)
  const [searchType, setSearchType] = useState('web')

  async function doSearch() {
    const q = query.trim()
    if (!q) return
    setSearching(true)
    setResults([])
    setAnswer(null)

    try {
      const d = await api.post('/ai/search', { query: q, type: searchType })
      setResults(d.results || [])

      // Get personalized answer
      if (searchType === 'web') {
        api.post('/ai/search/answer', { query: q, webResults: d.results || [] })
          .then((a) => { if (a.answer) setAnswer(a) })
          .catch(() => {})
      }
    } catch {} finally {
      setSearching(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') doSearch()
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-3xl mx-auto">
        {/* Search bar */}
        <div
          className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <SearchIcon size={15} style={{ color: 'var(--text-tertiary)', opacity: 0.6 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your memories and the web..."
            className="flex-1 bg-transparent border-none outline-none text-sm"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Type toggle */}
        <div className="flex gap-1.5 mb-5">
          {['web', 'youtube'].map((t) => (
            <button
              key={t}
              onClick={() => setSearchType(t)}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize cursor-pointer"
              style={{
                background: searchType === t ? 'rgba(91,71,224,0.1)' : 'var(--bg-muted)',
                color: searchType === t ? 'var(--color-brand)' : 'var(--text-secondary)',
                border: `1px solid ${searchType === t ? 'rgba(91,71,224,0.25)' : 'var(--border-default)'}`,
              }}
            >
              {t === 'youtube' ? '▶ YouTube' : 'Web'}
            </button>
          ))}
        </div>

        {searching && (
          <div className="py-8 text-center text-xs" style={{ color: 'var(--text-tertiary)' }}>Searching...</div>
        )}

        {/* AI answer */}
        {answer && (
          <div
            className="rounded-xl p-5 mb-5"
            style={{ background: 'var(--bg-surface)', border: '1px solid rgba(91,71,224,0.15)', borderLeft: '3px solid var(--color-brand)' }}
          >
            <p className="text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-brand)' }}>
              ✦ AI answer {answer.memory_used ? '· using your memories' : ''}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{answer.answer}</p>
            {answer.sources?.length > 0 && (
              <p className="text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
                Sources: {answer.sources.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-xl p-4 transition-all hover:-translate-y-0.5 cursor-pointer"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
              onClick={() => r.url && window.open(r.url, '_blank')}
            >
              {searchType === 'youtube' ? (
                <>
                  <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{r.title}</h4>
                  <p className="text-xs mb-1" style={{ color: 'var(--color-brand)' }}>{r.channel} · {r.duration}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{r.description}</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Globe size={12} style={{ color: 'var(--text-tertiary)' }} />
                    <span className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{r.site}</span>
                    {r.date && <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>· {r.date}</span>}
                  </div>
                  <h4 className="text-sm font-semibold mb-1" style={{ color: 'var(--color-brand)' }}>{r.title}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.snippet}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
