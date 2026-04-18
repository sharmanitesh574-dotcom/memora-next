'use client'

import { useUIStore } from '@/stores'
import { useRouter } from 'next/navigation'
import { FileText, Mic, Camera } from 'lucide-react'

export function BottomSheet() {
  const isOpen = useUIStore((s) => s.bottomSheetOpen)
  const close = useUIStore((s) => s.closeBottomSheet)
  const openVoice = useUIStore((s) => s.openVoiceOverlay)
  const router = useRouter()

  function handleText() {
    close()
    router.push('/dashboard')
    setTimeout(() => {
      document.querySelector('textarea[placeholder*="mind"]')?.focus()
    }, 200)
  }

  function handleVoice() {
    close()
    openVoice()
  }

  function handlePhoto() {
    close()
    document.querySelector('input[type="file"]')?.click()
  }

  const options = [
    { label: 'Text', sub: 'Type a thought', icon: FileText, color: 'var(--color-brand)', bg: 'rgba(91,71,224,0.07)', action: handleText },
    { label: 'Voice', sub: 'Speak naturally', icon: Mic, color: 'var(--color-coral)', bg: 'rgba(209,78,107,0.08)', action: handleVoice },
    { label: 'Photo/File', sub: 'Attach media', icon: Camera, color: 'var(--color-emerald)', bg: 'rgba(22,163,122,0.08)', action: handlePhoto },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-[600] bg-black/30 transition-opacity"
          onClick={close}
        />
      )}

      {/* Sheet */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-[601] rounded-t-2xl transition-transform duration-300"
        style={{
          background: 'var(--bg-surface)',
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
        }}
      >
        {/* Handle */}
        <div className="w-9 h-1 rounded-full mx-auto mt-2.5 mb-4" style={{ background: 'var(--border-hover)' }} />

        <h3 className="font-display text-lg font-bold tracking-tight px-5 pb-3" style={{ color: 'var(--text-primary)' }}>
          Capture
        </h3>

        <div className="grid grid-cols-3 gap-2.5 px-5 pb-4">
          {options.map((opt) => (
            <button
              key={opt.label}
              onClick={opt.action}
              className="flex flex-col items-center gap-2 py-5 px-3 rounded-2xl bg-transparent border-none active:scale-95 transition-transform cursor-pointer"
              style={{ background: 'var(--bg-muted)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: opt.bg, color: opt.color }}
              >
                <opt.icon size={22} />
              </div>
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{opt.label}</span>
              <span className="text-[10px] -mt-1" style={{ color: 'var(--text-tertiary)' }}>{opt.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
