const KEY = 'arenahub:session'

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function setSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(KEY)
}
