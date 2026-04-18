'use client'

import { useTimeAgo } from '@/hooks'
import { useUIStore } from '@/stores'
import { clsx } from 'clsx'

const toneColors = {
  energized: { bg: 'rgba(22,163,122,0.1)', color: '#0e9d79', dot: '#16A37A' },
  resolved: { bg: 'rgba(91,71,224,0.08)', color: '#5b47e0', dot: '#5B47E0' },
  anxious: { bg: 'rgba(209,78,107,0.08)', color: '#c04060', dot: '#D14E6B' },
  stuck: { bg: 'rgba(196,127,23,0.08)', color: '#b07515', dot: '#C47F17' },
}

function generateWaveform(seed) {
  const bars = []
  let v = 0.4
  for (let i = 0; i < 28; i++) {
    v += Math.sin(seed * 13.7 + i * 0.8) * 0.3 + Math.cos(i * 1.3) * 0.15
    v = Math.max(0.1, Math.min(1, v))
    bars.push(v)
  }
  return bars
}

function formatDuration(ms) {
  if (!ms) return ''
  const s = Math.round(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export function MemoryCard({ memory: m }) {
  const openDrawer = useUIStore((s) => s.openDrawer)
  const t = m.type || 'note'
  const timeAgo = useTimeAgo(m.created_at)
  const imp = m.importance_score >= 70 ? 'high' : m.importance_score >= 40 ? 'mid' : 'low'
  const connections = m.connections || []
  const tags = (m.tags || []).slice(0, 3)
  const title = m.title || (m.content || '').slice(0, 50)
  const tone = m.tone && m.tone !== 'neutral' ? toneColors[m.tone] : null

  return (
    <div
      onClick={() => openDrawer(m.id)}
      className={clsx(
        'group relative rounded-2xl overflow-hidden cursor-pointer flex flex-col',
        'transition-all duration-200',
        'hover:-translate-y-0.5'
      )}
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Top gradient band */}
      <div className={`h-[3px] w-full bg-gradient-to-r type-band-${t}`} />

      {/* Importance dot */}
      <div
        className={clsx(
          'absolute top-3.5 right-3.5 w-[7px] h-[7px] rounded-full transition-transform',
          'group-hover:scale-125 group-hover:opacity-0',
          imp === 'high' && 'shadow-[0_0_6px_rgba(209,78,107,0.4)]',
        )}
        style={{
          background: imp === 'high' ? '#D14E6B' : imp === 'mid' ? '#C47F17' : 'var(--text-tertiary)',
        }}
      />

      {/* Body */}
      <div className="flex-1 flex flex-col px-[18px] pt-4 pb-3.5">
        {/* Type + tone row */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wide"
            style={{
              background: `var(--type-${t}-bg, var(--bg-muted))`,
              color: `var(--type-${t}-color, var(--text-secondary))`,
            }}
          >
            {t}
          </span>
          {tone && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
              style={{ background: tone.bg, color: tone.color }}
            >
              <span className="w-[5px] h-[5px] rounded-full" style={{ background: tone.dot }} />
              {m.tone}
            </span>
          )}
          {m.attachment_url && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px]"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}
            >
              📎
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-[15px] font-semibold leading-snug tracking-tight mb-1.5" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>

        {/* Voice waveform */}
        {t === 'voice' && (
          <>
            <div className="flex items-end gap-0.5 h-8 py-1 opacity-60 group-hover:opacity-90 transition-opacity">
              {generateWaveform((m.id || 'x').charCodeAt(0)).map((h, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm"
                  style={{ height: `${Math.round(h * 28)}px`, background: 'var(--color-ocean)', minHeight: '3px' }}
                />
              ))}
            </div>
            {m.duration_ms && (
              <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--color-ocean)' }}>
                {formatDuration(m.duration_ms)}
              </p>
            )}
          </>
        )}

        {/* Content */}
        <p
          className="text-[13px] leading-relaxed flex-1 line-clamp-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          {m.content}
        </p>

        {/* Goal progress */}
        {t === 'goal' && m.memory_stage === 'active' && (
          <div className="mt-2 h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round((m.importance_score || 30) * 1.1))}%`, background: 'var(--color-emerald)' }}
            />
          </div>
        )}

        {/* Decision badge */}
        {m.is_decision && (
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-wide mt-2 w-fit"
            style={{ background: 'rgba(196,127,23,0.1)', border: '1px solid rgba(196,127,23,0.2)', color: 'var(--color-amber)' }}
          >
            ⑂ Decision point
          </div>
        )}

        {/* AI Reflection */}
        {m.reflection && (
          <div
            className="mt-2.5 px-3 py-2.5 rounded-xl"
            style={{ background: 'var(--color-brand-light)', borderLeft: '2px solid rgba(91,71,224,0.3)' }}
          >
            <p className="text-[8px] font-semibold uppercase tracking-wider mb-0.5 opacity-70" style={{ color: 'var(--color-brand)' }}>
              AI reflection
            </p>
            <p className="font-serif text-[13px] italic leading-relaxed line-clamp-2" style={{ color: 'var(--color-brand)' }}>
              {m.reflection}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-[18px] pb-3.5 pt-2.5 gap-2">
        <span className="text-[10px] whitespace-nowrap" style={{ color: 'var(--text-tertiary)' }}>
          {timeAgo}
        </span>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}
            >
              {tag}
            </span>
          ))}
          {connections.length > 0 && (
            <div className="flex items-center gap-0.5">
              {connections.slice(0, 4).map((_, i) => (
                <div
                  key={i}
                  className="w-[5px] h-[5px] rounded-full opacity-50 group-hover:opacity-85 group-hover:scale-110 transition-all"
                  style={{ background: 'var(--color-brand)' }}
                />
              ))}
              <span className="text-[9px] font-medium ml-0.5 opacity-60" style={{ color: 'var(--color-brand)' }}>
                {connections.length}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
