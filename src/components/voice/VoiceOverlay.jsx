'use client'

import { useState, useCallback } from 'react'
import { useUIStore, useMemoryStore } from '@/stores'
import { useVoiceRecorder, useGreeting } from '@/hooks'
import { useUserStore } from '@/stores'
import { api } from '@/lib/api'
import { X } from 'lucide-react'

export function VoiceOverlay() {
  const isOpen = useUIStore((s) => s.voiceOverlayOpen)
  const close = useUIStore((s) => s.closeVoiceOverlay)
  const user = useUserStore((s) => s.user)
  const createMemory = useMemoryStore((s) => s.createMemory)
  const greeting = useGreeting(user?.name)

  const { isRecording, duration, analyserData, startRecording, stopRecording } = useVoiceRecorder()
  const [status, setStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  const handleToggleRecord = useCallback(async () => {
    if (isRecording) {
      setStatus('thinking')
      const blob = await stopRecording()
      if (!blob) return

      try {
        const form = new FormData()
        form.append('audio', blob, 'voice.webm')
        const res = await api.post('/voice/transcribe', form)
        setTranscript(res.text || '')
        setStatus('done')
      } catch {
        setStatus('error')
      }
    } else {
      setTranscript('')
      const ok = await startRecording()
      if (ok) setStatus('recording')
      else setStatus('error')
    }
  }, [isRecording, startRecording, stopRecording])

  const handleSave = useCallback(async () => {
    if (!transcript.trim()) return
    try {
      await createMemory({ type: 'voice', content: transcript })
      setTranscript('')
      setStatus('idle')
      close()
    } catch {}
  }, [transcript, createMemory, close])

  const handleClose = useCallback(() => {
    if (isRecording) stopRecording()
    setStatus('idle')
    setTranscript('')
    close()
  }, [isRecording, stopRecording, close])

  if (!isOpen) return null

  const waveformBars = analyserData || new Array(32).fill(0)

  return (
    <div
      className="fixed inset-0 z-[700] flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(180deg, rgba(8,6,22,0.97), rgba(12,11,24,0.97))' }}
    >
      {/* Close */}
      <button
        onClick={handleClose}
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center border-none cursor-pointer"
        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
      >
        <X size={18} />
      </button>

      {/* Greeting */}
      <p className="text-white/50 text-sm mb-6 font-display">{greeting} ✦</p>

      {/* Orb */}
      <button
        onClick={handleToggleRecord}
        className="w-24 h-24 rounded-full flex items-center justify-center border-none cursor-pointer mb-6 transition-all"
        style={{
          background: isRecording ? 'var(--color-coral)' : status === 'thinking' ? 'var(--color-brand)' : 'var(--color-brand)',
          boxShadow: isRecording ? '0 0 0 0 rgba(208,78,107,0.4)' : 'none',
          animation: isRecording ? 'orbpulse 1.2s infinite' : status === 'thinking' ? 'orbspin 1.5s linear infinite' : 'none',
        }}
      >
        <svg width="38" height="38" viewBox="0 0 28 28" fill="none">
          <rect x="10" y="3" width="8" height="13" rx="4" stroke="white" strokeWidth="1.5" />
          <path d="M6 15a8 8 0 0016 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M14 23v-4M11 27h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {/* Timer */}
      {isRecording && (
        <p className="font-mono text-3xl font-medium text-white/90 tracking-wider mb-2">
          {formatTime(duration)}
        </p>
      )}

      {/* Waveform */}
      {isRecording && (
        <div className="flex items-center justify-center gap-[3px] h-12 w-72 mb-2">
          {waveformBars.slice(0, 32).map((val, i) => (
            <div
              key={i}
              className="w-1 rounded-sm transition-[height] duration-75"
              style={{
                height: `${Math.max(4, Math.round((val / 255) * 44))}px`,
                background: val > 80 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.4)',
                minHeight: '4px',
              }}
            />
          ))}
        </div>
      )}

      {/* Status */}
      <h2 className="font-display text-xl font-bold text-white mb-2 text-center">
        {status === 'idle' && 'Tap to speak'}
        {status === 'recording' && 'Listening...'}
        {status === 'thinking' && 'Transcribing...'}
        {status === 'done' && 'Got it'}
        {status === 'error' && 'Something went wrong'}
      </h2>
      <p className="text-sm text-white/50 text-center max-w-[280px] leading-relaxed">
        {status === 'idle' && 'Tap the button and speak naturally'}
        {status === 'recording' && 'Tap again to stop'}
        {status === 'thinking' && 'Processing your voice...'}
        {status === 'done' && 'Review and save your memory'}
        {status === 'error' && 'Microphone access may be blocked'}
      </p>

      {/* Transcript */}
      {transcript && (
        <div
          className="mt-4 px-4 py-3 rounded-xl max-w-[340px] w-full text-sm leading-relaxed text-left"
          style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.85)' }}
        >
          {transcript}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2.5 mt-5">
        {status === 'done' && transcript && (
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white border-none cursor-pointer"
            style={{ background: 'var(--color-brand)' }}
          >
            Save memory
          </button>
        )}
        <button
          onClick={status === 'done' ? () => { setStatus('idle'); setTranscript('') } : handleToggleRecord}
          className="px-5 py-2.5 rounded-lg text-sm text-white border-none cursor-pointer"
          style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.18)' }}
        >
          {status === 'done' ? 'Try again' : isRecording ? 'Stop' : 'Start recording'}
        </button>
      </div>

      <style jsx global>{`
        @keyframes orbpulse { 0%,100% { box-shadow: 0 0 0 0 rgba(208,78,107,0.4); } 70% { box-shadow: 0 0 0 20px rgba(208,78,107,0); } }
        @keyframes orbspin { 0%,100% { box-shadow: 0 0 0 0 rgba(91,80,200,0.3); } 50% { box-shadow: 0 0 0 16px rgba(91,80,200,0); } }
      `}</style>
    </div>
  )
}
