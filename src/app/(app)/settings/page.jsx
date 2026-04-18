'use client'

import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { useUserStore } from '@/stores'
import { User, Brain, Moon, Sun, Bell, MessageCircle, Lock, Smartphone, Phone, Globe } from 'lucide-react'
import { LANGUAGES, getLanguage, setLanguage as setLangStorage } from '@/i18n/translations'

export default function SettingsPage() {
  const user = useUserStore((s) => s.user)
  const plan = useUserStore((s) => s.plan)
  const [darkMode, setDarkMode] = useState(false)
  const [lang, setLang] = useState('en')
  const [profileText, setProfileText] = useState('')
  const [profileStatus, setProfileStatus] = useState('')
  const [profileData, setProfileData] = useState(null)
  const [tgStatus, setTgStatus] = useState(null)
  const [tgLink, setTgLink] = useState(null)
  const [waStatus, setWaStatus] = useState(null)
  const [waCode, setWaCode] = useState(null)
  const [waLoading, setWaLoading] = useState(false)
  const [changePass, setChangePass] = useState({ current: '', new: '', status: '' })

  useEffect(() => {
    setDarkMode(document.documentElement.classList.contains('dark'))
    setLang(getLanguage())
    loadProfile()
    loadTelegramStatus()
    loadWhatsAppStatus()
  }, [])

  async function loadProfile() {
    try {
      const d = await api.get('/intelligence/profile')
      setProfileData(d)
    } catch {}
  }

  async function saveProfile() {
    if (!profileText.trim()) return
    setProfileStatus('Saving...')
    try {
      await api.put('/intelligence/profile', { content: profileText })
      setProfileStatus('Saved')
      setTimeout(() => setProfileStatus(''), 2000)
    } catch { setProfileStatus('Failed') }
  }

  function toggleDark() {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('memora-dark', next ? '1' : '0')
  }

  async function loadTelegramStatus() {
    try {
      const d = await api.get('/telegram/status')
      setTgStatus(d)
    } catch {}
  }

  async function connectTelegram() {
    try {
      const d = await api.post('/telegram/generate-link', {})
      setTgLink(d.link)
    } catch {}
  }

  async function loadWhatsAppStatus() {
    try {
      const d = await api.get('/whatsapp/status')
      setWaStatus(d)
    } catch {}
  }

  async function connectWhatsApp() {
    setWaLoading(true)
    try {
      const d = await api.post('/whatsapp/generate-link', {})
      setWaCode(d)
    } catch {} finally {
      setWaLoading(false)
    }
  }

  async function unlinkWhatsApp() {
    try {
      await api.del('/whatsapp/unlink')
      setWaStatus({ linked: false })
      setWaCode(null)
    } catch {}
  }

  async function handleChangePassword() {
    if (!changePass.current || !changePass.new) return
    setChangePass((p) => ({ ...p, status: 'Saving...' }))
    try {
      await api.post('/auth/change-password', { currentPassword: changePass.current, newPassword: changePass.new })
      setChangePass({ current: '', new: '', status: 'Password changed' })
    } catch (e) {
      setChangePass((p) => ({ ...p, status: e.message || 'Failed' }))
    }
  }

  const isPro = plan?.plan === 'pro'
  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-10">
      <div className="max-w-lg mx-auto">
        <h1 className="font-display text-xl font-bold tracking-tight mb-5" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>

        {/* Account card */}
        <div
          className="flex items-center gap-3.5 rounded-xl p-4 mb-3"
          style={{ background: 'var(--sidebar-bg)' }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-medium text-white shrink-0"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || '—'}</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{user?.email || '—'}</p>
          </div>
          <span
            className="text-[9px] font-semibold px-2 py-0.5 rounded"
            style={{ background: isPro ? 'rgba(196,127,23,0.2)' : 'rgba(255,255,255,0.08)', color: isPro ? '#e8a02a' : 'rgba(255,255,255,0.5)' }}
          >
            {isPro ? 'Pro' : 'Free'}
          </span>
        </div>

        {/* AI Profile */}
        <Section title="My AI profile" icon={Brain}>
          {profileData && (
            <div className="space-y-2 mb-3">
              {profileData.goals?.length > 0 && <ProfileList label="Goals" items={profileData.goals} />}
              {profileData.patterns?.length > 0 && <ProfileList label="Patterns" items={profileData.patterns} />}
              {profileData.preferences?.length > 0 && <ProfileList label="Preferences" items={profileData.preferences} />}
              {profileData.risks?.length > 0 && <ProfileList label="Risks" items={profileData.risks} />}
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border-default)', paddingTop: '12px' }}>
            <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>
              Tell Memora about yourself
            </p>
            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
              Context the AI will always use — your role, preferences, working style.
            </p>
            <textarea
              value={profileText}
              onChange={(e) => setProfileText(e.target.value)}
              placeholder="e.g. I'm a solo founder. I prefer direct feedback. My main focus is shipping fast."
              className="w-full px-3 py-2 rounded-lg text-xs resize-none outline-none"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', minHeight: '72px' }}
              rows={3}
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={saveProfile}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white cursor-pointer"
                style={{ background: 'var(--color-brand)' }}
              >
                Save context
              </button>
              {profileStatus && <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{profileStatus}</span>}
            </div>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={darkMode ? Moon : Sun}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Dark mode</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Easier on the eyes at night</p>
            </div>
            <button
              onClick={toggleDark}
              className="w-10 h-5 rounded-full relative cursor-pointer transition-colors"
              style={{ background: darkMode ? 'var(--color-brand)' : 'var(--border-hover)' }}
            >
              <div
                className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                style={{ left: darkMode ? '22px' : '2px' }}
              />
            </button>
          </div>
        </Section>

        {/* Language */}
        <Section title="Language" icon={Globe}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Choose your preferred language for the UI and AI responses.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setLang(l.code)
                  setLangStorage(l.code)
                  window.location.reload()
                }}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left cursor-pointer transition-all"
                style={{
                  background: lang === l.code ? 'rgba(124,92,252,0.06)' : 'var(--bg-muted)',
                  border: `1px solid ${lang === l.code ? 'rgba(124,92,252,0.2)' : 'var(--border-default)'}`,
                }}
              >
                <div className="flex-1">
                  <p className="text-xs font-medium" style={{ color: lang === l.code ? 'var(--color-brand)' : 'var(--text-primary)' }}>
                    {l.native}
                  </p>
                  <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{l.label}</p>
                </div>
                {lang === l.code && (
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ background: 'var(--color-brand)' }} />
                )}
              </button>
            ))}
          </div>
        </Section>

        {/* Telegram */}
        <Section title="Telegram" icon={MessageCircle}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Save memories by messaging the bot. Get briefings on demand.
          </p>
          {tgStatus?.linked ? (
            <p className="text-xs" style={{ color: 'var(--color-emerald)' }}>
              Connected as {tgStatus.name}
            </p>
          ) : tgLink ? (
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Open this link on your phone:</p>
              <a href={tgLink} target="_blank" rel="noopener" className="text-xs break-all" style={{ color: 'var(--color-brand)' }}>{tgLink}</a>
            </div>
          ) : (
            <button
              onClick={connectTelegram}
              className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            >
              Connect Telegram
            </button>
          )}
        </Section>

        {/* WhatsApp */}
        <Section title="WhatsApp" icon={Phone}>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Send thoughts, voice notes, or images via WhatsApp — they become memories automatically.
          </p>
          {waStatus?.linked ? (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--color-emerald)' }} />
                <p className="text-xs font-medium" style={{ color: 'var(--color-emerald)' }}>
                  Connected — {waStatus.name} ({waStatus.number})
                </p>
              </div>
              <p className="text-[11px] mb-3" style={{ color: 'var(--text-tertiary)' }}>
                Linked {waStatus.linkedAt ? new Date(waStatus.linkedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </p>
              <button
                onClick={unlinkWhatsApp}
                className="text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                style={{ color: 'var(--color-coral)', border: '1px solid rgba(209,78,107,0.3)' }}
              >
                Disconnect WhatsApp
              </button>
            </div>
          ) : waCode ? (
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Step 1: Save this number in your contacts
              </p>
              <p className="text-sm font-mono font-semibold mb-3" style={{ color: 'var(--color-brand)' }}>
                {process.env.NEXT_PUBLIC_WA_NUMBER || '+1 (XXX) XXX-XXXX'}
              </p>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Step 2: Send this message on WhatsApp
              </p>
              <div
                className="flex items-center justify-between rounded-lg px-3 py-2.5 mb-2"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
              >
                <code className="text-sm font-mono font-bold tracking-wide" style={{ color: 'var(--color-brand)' }}>
                  /link {waCode.code}
                </code>
                <button
                  onClick={() => { navigator.clipboard.writeText(`/link ${waCode.code}`); }}
                  className="text-[10px] px-2 py-1 rounded cursor-pointer"
                  style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
                >
                  Copy
                </button>
              </div>
              <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                Code expires in 15 minutes
              </p>
            </div>
          ) : (
            <button
              onClick={connectWhatsApp}
              disabled={waLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{ background: '#25D366', color: '#fff', border: 'none' }}
            >
              <Phone size={14} />
              {waLoading ? 'Generating code...' : 'Connect WhatsApp'}
            </button>
          )}
        </Section>

        {/* Change password */}
        <Section title="Security" icon={Lock}>
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Current password"
              value={changePass.current}
              onChange={(e) => setChangePass((p) => ({ ...p, current: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
            <input
              type="password"
              placeholder="New password (min 6 chars)"
              value={changePass.new}
              onChange={(e) => setChangePass((p) => ({ ...p, new: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg text-xs outline-none"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleChangePassword}
                className="px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer"
                style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
              >
                Change password
              </button>
              {changePass.status && (
                <span className="text-[10px]" style={{ color: changePass.status === 'Password changed' ? 'var(--color-emerald)' : 'var(--color-coral)' }}>
                  {changePass.status}
                </span>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div
      className="rounded-xl p-4 mb-3"
      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon size={14} style={{ color: 'var(--text-tertiary)' }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>{title}</h3>
      </div>
      {children}
    </div>
  )
}

function ProfileList({ label, items }) {
  return (
    <div>
      <p className="text-[10px] font-medium uppercase tracking-wider mb-1" style={{ color: 'var(--text-tertiary)' }}>{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <span
            key={i}
            className="text-xs px-2 py-0.5 rounded-md"
            style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
