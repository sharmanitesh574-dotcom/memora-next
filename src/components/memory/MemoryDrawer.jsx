'use client'

import { useState, useEffect, useRef } from 'react'
import { useUIStore, useMemoryStore } from '@/stores'
import { api } from '@/lib/api'
import { X, Trash2, Save, Tag, Link2, Paperclip, Clock, Target, AlertTriangle } from 'lucide-react'
import { useTimeAgo } from '@/hooks'

const TYPES = ['thought', 'note', 'goal', 'event', 'voice', 'journal', 'research']

export function MemoryDrawer() {
  const memoryId = useUIStore((s) => s.drawerMemoryId)
  const close = useUIStore((s) => s.closeDrawer)
  const memories = useMemoryStore((s) => s.memories)
  const updateMemory = useMemoryStore((s) => s.updateMemory)
  const deleteMemory = useMemoryStore((s) => s.deleteMemory)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [type, setType] = useState('thought')
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [deleteArmed, setDeleteArmed] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [connections, setConnections] = useState([])
  const contentRef = useRef(null)
  const deleteTimer = useRef(null)

  const memory = memories.find((m) => m.id === memoryId)
  const timeAgo = useTimeAgo(memory?.created_at)

  // Sync form state when memory changes
  useEffect(() => {
    if (!memory) return
    setTitle(memory.title || '')
    setContent(memory.content || '')
    setType(memory.type || 'thought')
    setTags(memory.tags || [])
    setSaveStatus('')
    setDeleteArmed(false)
    loadConnections()
  }, [memoryId])

  async function loadConnections() {
    if (!memoryId) return
    try {
      const d = await api.get(`/intelligence/connections/${memoryId}`)
      setConnections(d.connections || [])
    } catch {
      setConnections([])
    }
  }

  async function handleSave() {
    if (!content.trim()) return
    setSaving(true)
    setSaveStatus('')
    try {
      await updateMemory(memoryId, {
        title: title || null,
        content,
        type,
        tags,
      })
      setSaveStatus('Saved')
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (err) {
      setSaveStatus('Failed: ' + (err.message || 'Unknown error'))
    } finally {
      setSaving(false)
    }
  }

  function handleDelete() {
    if (!deleteArmed) {
      setDeleteArmed(true)
      clearTimeout(deleteTimer.current)
      deleteTimer.current = setTimeout(() => setDeleteArmed(false), 2500)
      return
    }
    // Second tap — confirm delete
    setDeleting(true)
    deleteMemory(memoryId)
      .then(() => close())
      .catch(() => setDeleting(false))
  }

  function addTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  function removeTag(tag) {
    setTags(tags.filter((t) => t !== tag))
  }

  function handleTagKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(tags.slice(0, -1))
    }
  }

  function handleContentKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    }
  }

  if (!memoryId || !memory) return null

  const imp = memory.importance_score >= 70 ? 'High' : memory.importance_score >= 40 ? 'Medium' : 'Low'
  const impColor = memory.importance_score >= 70 ? 'var(--color-coral)' : memory.importance_score >= 40 ? 'var(--color-amber)' : 'var(--text-tertiary)'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/25 z-[400] transition-opacity" onClick={close} />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-[480px] z-[401] flex flex-col overflow-hidden transition-transform"
        style={{
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0"
          style={{ borderBottom: '1px solid var(--border-default)' }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-md"
              style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
            >
              {type}
            </span>
            {memory.tone && memory.tone !== 'neutral' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}>
                {memory.tone}
              </span>
            )}
          </div>
          <button
            onClick={close}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer transition-colors"
            style={{ border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Type selector */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              Type
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize cursor-pointer"
                  style={{
                    background: type === t ? 'rgba(91,71,224,0.1)' : 'var(--bg-muted)',
                    color: type === t ? 'var(--color-brand)' : 'var(--text-secondary)',
                    border: `1px solid ${type === t ? 'rgba(91,71,224,0.25)' : 'transparent'}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Optional title..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none font-display font-semibold"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              Content
            </label>
            <textarea
              ref={contentRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleContentKeyDown}
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none leading-relaxed"
              style={{
                background: 'var(--bg-muted)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                minHeight: '120px',
              }}
              rows={5}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
              <Tag size={10} /> Tags
            </label>
            <div
              className="flex flex-wrap gap-1.5 p-2 rounded-lg min-h-[36px]"
              style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs cursor-pointer transition-colors"
                  style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
                  onClick={() => removeTag(tag)}
                  title="Click to remove"
                >
                  {tag} <span style={{ opacity: 0.5 }}>×</span>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={addTag}
                placeholder={tags.length ? '' : 'Add tags...'}
                className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-xs"
                style={{ color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* AI Reflection */}
          {memory.reflection && (
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                AI Reflection
              </label>
              <div
                className="px-3.5 py-3 rounded-xl"
                style={{ background: 'var(--color-brand-light)', borderLeft: '2px solid rgba(91,71,224,0.3)' }}
              >
                <p className="font-serif text-sm italic leading-relaxed" style={{ color: 'var(--color-brand)' }}>
                  {memory.reflection}
                </p>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <Clock size={11} /> Created {timeAgo}
            </div>
            {memory.importance_score > 0 && (
              <div className="flex items-center gap-2 text-xs" style={{ color: impColor }}>
                <AlertTriangle size={11} /> Importance: {imp} ({memory.importance_score})
              </div>
            )}
            {memory.action_item && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-amber)' }}>
                <Target size={11} /> Action: {memory.action_item}
              </div>
            )}
            {memory.attachment_url && (
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <Paperclip size={11} /> {memory.attachment_name || 'Attachment'}
              </div>
            )}
          </div>

          {/* Connected memories */}
          {connections.length > 0 && (
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider flex items-center gap-1 mb-2" style={{ color: 'var(--text-tertiary)' }}>
                <Link2 size={10} /> Connected memories
              </label>
              <div className="space-y-1.5">
                {connections.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => useUIStore.getState().openDrawer(c.id)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                    style={{ background: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--color-brand)' }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                        {c.title || (c.content || '').slice(0, 50)}
                      </p>
                      <p className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{c.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Topics */}
          {memory.topics?.length > 0 && (
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-tertiary)' }}>
                Topics
              </label>
              <div className="flex flex-wrap gap-1.5">
                {memory.topics.map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — save + delete */}
        <div
          className="flex items-center justify-between px-5 py-3.5 shrink-0 gap-3"
          style={{ borderTop: '1px solid var(--border-default)' }}
        >
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
            style={{
              background: deleteArmed ? 'var(--color-coral)' : 'var(--bg-muted)',
              color: deleteArmed ? '#fff' : 'var(--text-secondary)',
              border: `1px solid ${deleteArmed ? 'var(--color-coral)' : 'var(--border-default)'}`,
            }}
          >
            <Trash2 size={12} />
            {deleting ? 'Deleting...' : deleteArmed ? 'Tap again to confirm' : 'Delete'}
          </button>

          <div className="flex items-center gap-2">
            {saveStatus && (
              <span
                className="text-[10px] font-medium"
                style={{ color: saveStatus === 'Saved' ? 'var(--color-emerald)' : 'var(--color-coral)' }}
              >
                {saveStatus}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !content.trim()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white cursor-pointer transition-all disabled:opacity-40"
              style={{ background: 'var(--color-brand)' }}
            >
              <Save size={12} />
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: full-height bottom sheet style */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .fixed.right-0.top-0.max-w-\\[480px\\] {
            max-width: 100% !important;
            top: auto !important;
            bottom: 0 !important;
            height: 92dvh !important;
            border-radius: 20px 20px 0 0 !important;
            border-left: none !important;
            border-top: 1px solid var(--border-default) !important;
          }
        }
      `}</style>
    </>
  )
}
