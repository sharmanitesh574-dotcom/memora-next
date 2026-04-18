'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { X, ChevronRight, ChevronLeft, Star, Target, Lightbulb, CheckCircle, ArrowRight } from 'lucide-react'

const STEPS = [
  { title: 'Your week in numbers', icon: Star },
  { title: 'Top moments', icon: Lightbulb },
  { title: 'AI summary', icon: Star },
  { title: 'Pending actions', icon: Target },
  { title: 'Set next week\'s intention', icon: ArrowRight },
]

export function WeeklyReview({ isOpen, onClose }) {
  const [step, setStep] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [intention, setIntention] = useState('')
  const [intentionSaved, setIntentionSaved] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setStep(0)
    setIntention('')
    setIntentionSaved(false)
    setLoading(true)
    api.get('/intelligence/weekly-review')
      .then((d) => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  async function saveIntention() {
    if (!intention.trim()) return
    try {
      await api.post('/memories', {
        type: 'goal',
        content: intention,
        title: `Weekly intention: ${intention.slice(0, 40)}`,
      })
      setIntentionSaved(true)
    } catch {}
  }

  function next() { if (step < STEPS.length - 1) setStep(step + 1) }
  function prev() { if (step > 0) setStep(step - 1) }

  const StepIcon = STEPS[step].icon

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[500]" onClick={onClose} />
      <div
        className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[480px] md:max-h-[600px] z-[501] rounded-2xl flex flex-col overflow-hidden"
        style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border-default)' }}>
          <div className="flex items-center gap-2">
            <StepIcon size={16} style={{ color: 'var(--color-brand)' }} />
            <h2 className="font-display text-base font-bold tracking-tight">Weekly review</h2>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer" style={{ color: 'var(--text-tertiary)' }}>
            <X size={14} />
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-3">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all cursor-pointer"
              style={{ background: i === step ? 'var(--color-brand)' : i < step ? 'var(--color-emerald)' : 'var(--border-hover)' }}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <h3 className="font-display text-lg font-bold tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            {STEPS[step].title}
          </h3>

          {loading ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>Loading your week...</p>
          ) : !data ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-tertiary)' }}>Could not load review data.</p>
          ) : (
            <>
              {/* Step 0: Numbers */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <StatCard label="Memories this week" value={data.total} />
                    <StatCard label="Types captured" value={Object.keys(data.types).length} />
                  </div>
                  {Object.keys(data.types).length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Breakdown</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(data.types).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                          <span key={type} className="text-xs px-2.5 py-1 rounded-lg capitalize" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                            {type}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {Object.keys(data.tones).length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>Your mood this week</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(data.tones).sort((a, b) => b[1] - a[1]).map(([tone, count]) => (
                          <span key={tone} className="text-xs px-2.5 py-1 rounded-lg capitalize" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                            {tone}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 1: Highlights */}
              {step === 1 && (
                <div className="space-y-3">
                  {data.highlights.length ? data.highlights.map((h, i) => (
                    <div key={h.id} className="rounded-xl p-4" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-sm font-bold" style={{ color: 'var(--color-brand)' }}>#{i + 1}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded capitalize" style={{ background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>{h.type}</span>
                      </div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{h.title}</p>
                      {h.reflection && (
                        <p className="text-xs italic" style={{ color: 'var(--color-brand)', opacity: 0.7 }}>{h.reflection}</p>
                      )}
                    </div>
                  )) : (
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No highlights this week.</p>
                  )}
                </div>
              )}

              {/* Step 2: AI Summary */}
              {step === 2 && (
                <div>
                  {data.aiSummary ? (
                    <div className="rounded-xl p-4" style={{ background: 'var(--color-brand-light)', borderLeft: '2px solid rgba(91,71,224,0.3)' }}>
                      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-brand)' }}>
                        {data.aiSummary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Not enough memories for a summary yet. Keep capturing!</p>
                  )}
                </div>
              )}

              {/* Step 3: Actions */}
              {step === 3 && (
                <div className="space-y-2">
                  {data.actions.length ? data.actions.map((a) => (
                    <div key={a.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}>
                      <CheckCircle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--text-tertiary)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{a.action_item}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>{a.title || (a.content || '').slice(0, 40)}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No pending actions. Nice work!</p>
                  )}
                </div>
              )}

              {/* Step 4: Intention */}
              {step === 4 && (
                <div>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                    What's the one thing you want to focus on next week?
                  </p>
                  {intentionSaved ? (
                    <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(22,163,122,0.08)', border: '1px solid rgba(22,163,122,0.2)' }}>
                      <p className="text-sm font-medium" style={{ color: 'var(--color-emerald)' }}>Intention saved as a goal</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>"{intention}"</p>
                    </div>
                  ) : (
                    <>
                      <textarea
                        value={intention}
                        onChange={(e) => setIntention(e.target.value)}
                        placeholder="e.g. Ship the WhatsApp integration and get 5 users testing it"
                        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none leading-relaxed"
                        style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', minHeight: '80px' }}
                        rows={3}
                      />
                      <button
                        onClick={saveIntention}
                        disabled={!intention.trim()}
                        className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer disabled:opacity-40"
                        style={{ background: 'var(--color-brand)' }}
                      >
                        Save intention as goal
                      </button>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderTop: '1px solid var(--border-default)' }}>
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs font-medium cursor-pointer disabled:opacity-30"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ChevronLeft size={14} /> Back
          </button>
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            {step + 1} of {STEPS.length}
          </span>
          {step < STEPS.length - 1 ? (
            <button
              onClick={next}
              className="flex items-center gap-1 text-xs font-medium cursor-pointer"
              style={{ color: 'var(--color-brand)' }}
            >
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
              style={{ background: 'var(--color-brand)' }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl p-3.5" style={{ background: 'var(--bg-muted)' }}>
      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <p className="text-2xl font-bold font-display" style={{ color: 'var(--text-primary)' }}>{value}</p>
    </div>
  )
}
