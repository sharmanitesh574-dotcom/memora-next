'use client'

import { Plus } from 'lucide-react'
import { useUIStore } from '@/stores'
import { clsx } from 'clsx'

export function MobileFab() {
  const isOpen = useUIStore((s) => s.bottomSheetOpen)
  const toggle = useUIStore((s) => isOpen ? s.closeBottomSheet : s.openBottomSheet)

  return (
    <button
      onClick={toggle}
      className={clsx(
        'md:hidden fixed z-50 w-14 h-14 rounded-full flex items-center justify-center',
        'border-none text-white transition-all duration-200 active:scale-90',
        isOpen && 'rotate-45'
      )}
      style={{
        bottom: '72px',
        left: '50%',
        transform: `translateX(-50%)${isOpen ? ' rotate(45deg)' : ''}`,
        background: isOpen ? 'var(--text-tertiary)' : 'var(--color-brand)',
        boxShadow: isOpen ? 'none' : '0 4px 24px rgba(91,71,224,0.45)',
      }}
    >
      <Plus size={24} />
    </button>
  )
}
