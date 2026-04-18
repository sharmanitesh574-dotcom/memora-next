'use client'

import { useEffect } from 'react'
import { useUserStore } from '@/stores'
import { CreditCard, Check, Zap } from 'lucide-react'

const PRO_FEATURES = [
  'Unlimited memories',
  'Unlimited AI chats',
  'Voice transcription',
  'Morning briefings',
  'Pattern insights',
  'Priority support',
]

export default function BillingPage() {
  const plan = useUserStore((s) => s.plan)
  const fetchPlan = useUserStore((s) => s.fetchPlan)

  useEffect(() => { fetchPlan() }, [])

  const isPro = plan?.plan === 'pro'
  const memUsage = plan?.usage?.memories || 0
  const chatUsage = plan?.usage?.chats_today || 0
  const memLimit = isPro ? null : 10
  const chatLimit = isPro ? null : 5

  async function checkout() {
    try {
      const d = await (await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('mt')}`,
        },
      })).json()

      if (d.error) { alert(d.error); return }

      const options = {
        key: d.key,
        subscription_id: d.subscription_id,
        name: 'Memora Pro',
        description: 'Monthly subscription',
        handler: async (response) => {
          try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/billing/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('mt')}`,
              },
              body: JSON.stringify(response),
            })
            fetchPlan()
            alert('Welcome to Pro!')
          } catch { alert('Verification failed') }
        },
        prefill: { name: d.name, email: d.email },
        theme: { color: '#5B47E0' },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (e) {
      alert('Could not start checkout: ' + e.message)
    }
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-xl font-bold tracking-tight mb-5" style={{ color: 'var(--text-primary)' }}>
          Plan & Billing
        </h1>

        {/* Current plan */}
        <div
          className="rounded-xl p-5 mb-4"
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <p className="text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-tertiary)' }}>
            Current plan
          </p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              {isPro ? 'Pro' : 'Free'}
            </span>
            <span
              className="text-[9px] font-semibold px-2 py-0.5 rounded"
              style={{
                background: isPro ? 'rgba(196,127,23,0.15)' : 'var(--bg-muted)',
                color: isPro ? '#e8a02a' : 'var(--text-tertiary)',
              }}
            >
              {isPro ? 'Pro' : 'Free'}
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--text-secondary)' }}>
            {isPro
              ? 'Unlimited memories · Unlimited AI chats'
              : `${memUsage}/${memLimit} memories · ${chatUsage}/${chatLimit} chats today`}
          </p>

          {/* Usage bar */}
          {!isPro && (
            <div>
              <div className="flex justify-between text-[10px] mb-1" style={{ color: 'var(--text-tertiary)' }}>
                <span>Memory usage</span>
                <span>{memUsage}/{memLimit}</span>
              </div>
              <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-muted)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (memUsage / memLimit) * 100)}%`, background: 'var(--color-brand)' }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Pro card */}
        {!isPro && (
          <div
            className="rounded-xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, var(--color-brand) 0%, #3B2BB8 100%)',
              color: '#fff',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap size={18} />
              <h3 className="text-lg font-bold">Upgrade to Pro</h3>
            </div>
            <p className="text-sm opacity-80 mb-4">
              Unlimited memories, AI, voice & morning briefings.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {PRO_FEATURES.map((f) => (
                <div key={f} className="flex items-center gap-2 text-xs">
                  <Check size={12} className="opacity-70" />
                  <span className="opacity-90">{f}</span>
                </div>
              ))}
            </div>

            <button
              onClick={checkout}
              className="w-full py-3 rounded-xl text-sm font-semibold cursor-pointer transition-all hover:opacity-90"
              style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}
            >
              Upgrade — ₹299/month
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
