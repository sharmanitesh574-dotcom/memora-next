'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import { setToken, setUser } from '@/lib/auth'
import { useUserStore } from '@/stores'

export default function SignupPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const setUserState = useUserStore((s) => s.setUser)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.post('/auth/signup', { name, email, password, inviteCode: inviteCode || undefined })
      setToken(data.token)
      setUser(data.user)
      setUserState(data.user)
      router.replace('/dashboard')
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-5" style={{ background: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-base italic"
            style={{ background: 'var(--color-brand)', fontFamily: 'Georgia, serif' }}>M</div>
          <span className="text-lg font-semibold tracking-tight">Memora</span>
        </div>

        <div className="rounded-2xl p-7" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}>
          <h2 className="font-display text-2xl font-bold tracking-tight mb-1">Create your account</h2>
          <p className="text-xs mb-5" style={{ color: 'var(--text-secondary)' }}>Start capturing what matters</p>

          <form onSubmit={handleSubmit}>
            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />

            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />

            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
              className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />

            <label className="block text-[11px] font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Invite code (optional)</label>
            <input type="text" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-sm mb-4 outline-none"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }} />

            {error && <p className="text-xs mb-3" style={{ color: 'var(--color-coral)' }}>{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white mb-3 disabled:opacity-50 cursor-pointer"
              style={{ background: 'var(--color-brand)' }}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
          </form>

          <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
            Already have an account? <Link href="/login" style={{ color: 'var(--color-brand)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
