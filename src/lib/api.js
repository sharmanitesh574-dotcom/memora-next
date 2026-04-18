const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

class ApiError extends Error {
  constructor(message, status, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

async function request(path, options = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('mt') : null
  const headers = { ...options.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new ApiError(
      data.error || `Request failed (${res.status})`,
      res.status,
      data.code
    )
  }

  return res
}

export const api = {
  async get(path) {
    const res = await request(path)
    return res.json()
  },

  async post(path, body) {
    const res = await request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
    return res.json()
  },

  async put(path, body) {
    const res = await request(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    })
    return res.json()
  },

  async del(path) {
    const res = await request(path, { method: 'DELETE' })
    return res.json()
  },

  // Streaming endpoint for AI chat
  async stream(path, body, onChunk) {
    const res = await request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let full = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      for (const line of decoder.decode(value).split('\n')) {
        if (!line.startsWith('data: ')) continue
        try {
          const data = JSON.parse(line.slice(6))
          if (data.content) {
            full += data.content
            onChunk(data.content, full, data)
          }
          if (data.done) {
            onChunk(null, full, data)
          }
        } catch {}
      }
    }

    return full
  },
}

export { ApiError }
