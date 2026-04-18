'use client'

import { useState, useRef } from 'react'
import { useMemoryStore, useUIStore } from '@/stores'
import { api } from '@/lib/api'
import { Mic, Paperclip, Send } from 'lucide-react'

const TYPES = ['thought', 'note', 'goal', 'event']

export function QuickCapture() {
  const [type, setType] = useState('thought')
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [file, setFile] = useState(null)
  const fileRef = useRef(null)
  const createMemory = useMemoryStore((s) => s.createMemory)
  const openVoiceOverlay = useUIStore((s) => s.openVoiceOverlay)

  async function handleSave() {
    if (!content.trim() && !file) return
    setSaving(true)

    try {
      const body = file ? new FormData() : { type, content, title: title || undefined }

      if (file) {
        body.append('type', type)
        body.append('content', content)
        if (title) body.append('title', title)
        body.append('file', file)
      }

      await createMemory(body)
      setContent('')
      setTitle('')
      setFile(null)

      // Trigger background enrichment
      // (handled by the existing Express API)
    } catch (err) {
      console.error('Save failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden mb-5 transition-shadow focus-within:shadow-md"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Type chips */}
      <div className="flex gap-1.5 px-4 pt-3.5 pb-1 flex-wrap">
        {TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-all capitalize"
            style={{
              background: type === t ? 'rgba(91,71,224,0.1)' : 'var(--bg-muted)',
              color: type === t ? 'var(--color-brand)' : 'var(--text-secondary)',
              border: `1px solid ${type === t ? 'rgba(91,71,224,0.25)' : 'var(--border-default)'}`,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content textarea */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => { if (e.metaKey && e.key === 'Enter') handleSave() }}
        placeholder="What's on your mind? Capture it before it fades..."
        className="w-full px-4 pt-2 pb-1 text-sm resize-none outline-none leading-relaxed"
        style={{
          background: 'transparent',
          color: 'var(--text-primary)',
          minHeight: '52px',
          fontFamily: 'var(--font-body)',
        }}
        rows={2}
      />

      {/* File preview */}
      {file && (
        <div className="mx-4 mb-2 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: 'var(--bg-muted)' }}>
          <span>📎</span>
          <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{file.name}</span>
          <button onClick={() => setFile(null)} className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>✕</button>
        </div>
      )}

      {/* Bottom bar */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1 gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Optional title..."
          className="flex-1 text-xs py-1.5 px-3 rounded-lg outline-none"
          style={{
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)',
          }}
        />

        <div className="flex gap-1.5 shrink-0">
          <button
            onClick={openVoiceOverlay}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            title="Voice note"
          >
            <Mic size={14} />
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            title="Attach file"
          >
            <Paperclip size={14} />
          </button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.txt,.doc,.docx"
            onChange={(e) => { if (e.target.files[0]) setFile(e.target.files[0]) }}
          />

          <button
            onClick={handleSave}
            disabled={saving || (!content.trim() && !file)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: 'var(--color-brand)' }}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
