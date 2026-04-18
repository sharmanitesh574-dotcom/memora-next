import { create } from 'zustand'
import { api } from '@/lib/api'

export const useMemoryStore = create((set, get) => ({
  memories: [],
  isLoading: false,

  async fetchMemories() {
    set({ isLoading: true })
    try {
      const data = await api.get('/memories')
      set({ memories: data.memories || [], isLoading: false })
    } catch (err) {
      set({ isLoading: false })
      throw err
    }
  },

  async createMemory(body) {
    const data = await api.post('/memories', body)
    set((state) => ({
      memories: [data.memory, ...state.memories],
    }))
    return data
  },

  async updateMemory(id, body) {
    const data = await api.put(`/memories/${id}`, body)
    set((state) => ({
      memories: state.memories.map((m) =>
        m.id === id ? { ...m, ...data.memory } : m
      ),
    }))
    return data
  },

  async deleteMemory(id) {
    await api.del(`/memories/${id}`)
    set((state) => ({
      memories: state.memories.filter((m) => m.id !== id),
    }))
  },

  getRecent(count = 8) {
    return [...get().memories]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, count)
  },

  getByType(type) {
    return get().memories.filter((m) => m.type === type)
  },

  getStats() {
    const mems = get().memories
    const now = Date.now()
    const weekMs = 7 * 86400000
    return {
      total: mems.length,
      thisWeek: mems.filter((m) => now - new Date(m.created_at) < weekMs).length,
      goals: mems.filter((m) => m.type === 'goal' && m.memory_stage !== 'done').length,
      streak: calculateStreak(mems),
    }
  },
}))

function calculateStreak(memories) {
  const days = new Set(memories.map((m) => new Date(m.created_at).toDateString()))
  let streak = 0
  const d = new Date()
  while (days.has(d.toDateString())) {
    streak++
    d.setDate(d.getDate() - 1)
  }
  return streak
}

export const useUserStore = create((set) => ({
  user: null,
  plan: null,
  isLoggedIn: false,

  setUser(user) {
    set({ user, isLoggedIn: !!user })
  },

  async fetchPlan() {
    try {
      const data = await api.get('/billing/status')
      set({ plan: data })
    } catch {}
  },

  logout() {
    set({ user: null, plan: null, isLoggedIn: false })
  },
}))

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  drawerMemoryId: null,
  bottomSheetOpen: false,
  voiceOverlayOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  openDrawer: (id) => set({ drawerMemoryId: id }),
  closeDrawer: () => set({ drawerMemoryId: null }),
  openBottomSheet: () => set({ bottomSheetOpen: true }),
  closeBottomSheet: () => set({ bottomSheetOpen: false }),
  openVoiceOverlay: () => set({ voiceOverlayOpen: true }),
  closeVoiceOverlay: () => set({ voiceOverlayOpen: false }),
}))
