export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('mt')
}

export function setToken(token) {
  localStorage.setItem('mt', token)
}

export function getUser() {
  if (typeof window === 'undefined') return null
  try {
    return JSON.parse(localStorage.getItem('mu'))
  } catch {
    return null
  }
}

export function setUser(user) {
  localStorage.setItem('mu', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('mt')
  localStorage.removeItem('mu')
}

export function isLoggedIn() {
  return !!getToken()
}
