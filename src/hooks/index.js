'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Time ago (reactive) ──
export function useTimeAgo(dateStr) {
  const [text, setText] = useState(() => formatTimeAgo(dateStr))

  useEffect(() => {
    const interval = setInterval(() => setText(formatTimeAgo(dateStr)), 30000)
    return () => clearInterval(interval)
  }, [dateStr])

  return text
}

function formatTimeAgo(dateStr) {
  const ms = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// ── Greeting based on time ──
export function useGreeting(name) {
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hr = new Date().getHours()
    const tod = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening'
    const firstName = (name || '').trim().split(' ')[0]
    setGreeting(firstName ? `${tod}, ${firstName}` : tod)
  }, [name])

  return greeting
}

// ── Debounce ──
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

// ── Voice recording ──
export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [analyserData, setAnalyserData] = useState(null)
  const mediaRecRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const analyserRef = useRef(null)
  const audioCtxRef = useRef(null)
  const timerRef = useRef(null)
  const animRef = useRef(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      chunksRef.current = []

      const mediaRec = new MediaRecorder(stream)
      mediaRecRef.current = mediaRec
      mediaRec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mediaRec.start(100)
      setIsRecording(true)
      setDuration(0)

      // Timer
      const start = Date.now()
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - start) / 1000))
      }, 250)

      // Analyser for waveform
      const actx = new (window.AudioContext || window.webkitAudioContext)()
      const source = actx.createMediaStreamSource(stream)
      const analyser = actx.createAnalyser()
      analyser.fftSize = 64
      source.connect(analyser)
      audioCtxRef.current = actx
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)
      function draw() {
        analyser.getByteFrequencyData(data)
        setAnalyserData([...data])
        animRef.current = requestAnimationFrame(draw)
      }
      draw()

      return true
    } catch {
      return false
    }
  }, [])

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      if (!mediaRecRef.current) return resolve(null)

      mediaRecRef.current.onstop = () => {
        streamRef.current?.getTracks().forEach((t) => t.stop())
        if (animRef.current) cancelAnimationFrame(animRef.current)
        if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
        if (timerRef.current) clearInterval(timerRef.current)

        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setIsRecording(false)
        setAnalyserData(null)
        resolve(blob)
      }

      mediaRecRef.current.stop()
    })
  }, [])

  return { isRecording, duration, analyserData, startRecording, stopRecording }
}

// ── Media query ──
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(query)
    setMatches(mq.matches)
    const handler = (e) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 640px)')
