'use client'

import { usePathname, useRouter } from 'next/navigation'
import { clsx } from 'clsx'
import { useUserStore, useMemoryStore } from '@/stores'
import {
  LayoutGrid, Archive, MessageCircle, Target, Lightbulb,
  Search, Clock, Network, Settings, CreditCard, LogOut
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Home', icon: LayoutGrid, path: '/dashboard' },
  { label: 'Memories', icon: Archive, path: '/memories' },
  { label: 'Chat', icon: MessageCircle, path: '/chat' },
  { label: 'Goals', icon: Target, path: '/goals' },
  { label: 'Insights', icon: Lightbulb, path: '/insights' },
  { label: 'Search', icon: Search, path: '/search' },
  { label: 'Timeline', icon: Clock, path: '/timeline' },
]

const BOTTOM_ITEMS = [
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Billing', icon: CreditCard, path: '/billing' },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = useUserStore((s) => s.user)
  const plan = useUserStore((s) => s.plan)
  const stats = useMemoryStore((s) => s.getStats)()
  const logout = useUserStore((s) => s.logout)

  function handleLogout() {
    logout()
    localStorage.removeItem('mt')
    localStorage.removeItem('mu')
    router.replace('/login')
  }

  const isPro = plan?.plan === 'pro'
  const firstName = (user?.name || '').split(' ')[0] || 'User'
  const initials = (user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside
      className="hidden md:flex flex-col w-[210px] shrink-0 h-screen overflow-hidden"
      style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-sm italic shrink-0"
          style={{ background: 'var(--color-brand)', fontFamily: 'Georgia, serif' }}
        >
          M
        </div>
        <span className="text-sm font-medium" style={{ color: 'var(--sidebar-text)' }}>Memora</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.path
          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={clsx(
                'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors mb-0.5',
                active ? 'font-medium' : ''
              )}
              style={{
                color: active ? '#fff' : 'var(--sidebar-muted)',
                background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
              }}
            >
              <item.icon size={16} style={{ opacity: active ? 1 : 0.6 }} />
              {item.label}
              {item.label === 'Memories' && stats.total > 0 && (
                <span className="ml-auto text-[10px] opacity-50">{stats.total}</span>
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-2" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
        {/* Usage bar (free users) */}
        {!isPro && (
          <div className="px-3 py-2 mb-2">
            <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--sidebar-muted)' }}>
              <span>Memories</span>
              <span>{stats.total}/10</span>
            </div>
            <div className="h-[2px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, stats.total * 10)}%`, background: 'var(--color-brand)' }}
              />
            </div>
          </div>
        )}

        {BOTTOM_ITEMS.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-colors mb-0.5"
            style={{ color: 'var(--sidebar-muted)' }}
          >
            <item.icon size={15} style={{ opacity: 0.6 }} />
            {item.label}
          </button>
        ))}

        {/* User row */}
        <div className="flex items-center gap-2.5 px-3 py-2 mt-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--sidebar-text)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: 'var(--sidebar-text)' }}>{firstName}</div>
            <div className="text-[10px]" style={{ color: 'var(--sidebar-muted)' }}>{isPro ? 'Pro' : 'Free'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md transition-colors"
            style={{ color: 'var(--sidebar-muted)' }}
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  )
}
