'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LayoutGrid, Archive, MessageCircle, Lightbulb, Settings } from 'lucide-react'
import { clsx } from 'clsx'

const TABS = [
  { label: 'Home', icon: LayoutGrid, path: '/dashboard' },
  { label: 'Memories', icon: Archive, path: '/memories' },
  { label: 'Chat', icon: MessageCircle, path: '/chat' },
  { label: 'Insights', icon: Lightbulb, path: '/insights' },
  { label: 'More', icon: Settings, path: '/settings' },
]

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 flex justify-around"
      style={{
        background: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderTop: '0.5px solid var(--border-hover)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 6px), 6px)',
        paddingTop: '6px',
      }}
    >
      {TABS.map((tab) => {
        const active = pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => router.push(tab.path)}
            className={clsx(
              'flex flex-col items-center gap-1 px-3 py-1 min-w-[52px] bg-transparent border-none',
              'text-[9px] font-medium transition-colors cursor-pointer'
            )}
            style={{ color: active ? 'var(--color-brand)' : 'var(--text-tertiary)' }}
          >
            <tab.icon size={20} className={clsx('transition-transform', active && 'scale-110')} />
            <span>{tab.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
