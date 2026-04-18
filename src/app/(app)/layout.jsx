'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { isLoggedIn } from '@/lib/auth'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { MobileFab } from '@/components/capture/MobileFab'
import { BottomSheet } from '@/components/capture/BottomSheet'
import { VoiceOverlay } from '@/components/voice/VoiceOverlay'
import { MemoryDrawer } from '@/components/memory/MemoryDrawer'
import { useMemoryStore, useUserStore } from '@/stores'

export default function AppLayout({ children }) {
  const router = useRouter()
  const fetchMemories = useMemoryStore((s) => s.fetchMemories)
  const fetchPlan = useUserStore((s) => s.fetchPlan)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login')
      return
    }
    fetchMemories()
    fetchPlan()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <Sidebar />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>

      {/* Overlays */}
      <MemoryDrawer />
      <VoiceOverlay />
      <BottomSheet />
      <MobileFab />
      <MobileNav />
    </div>
  )
}
