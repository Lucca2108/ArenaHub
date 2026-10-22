import type { Session } from '@/types'

// A sessão (token + usuário) fica salva no localStorage do navegador,
// para a pessoa continuar logada mesmo depois de recarregar a página.
const CHAVE = 'arenahub:session'

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null
  const salvo = localStorage.getItem(CHAVE)
  if (!salvo) return null
  try {
    const sessao = JSON.parse(salvo) as Session
    if (!sessao?.token || !sessao?.user?.id || !sessao.user.role) {
      clearSession()
      return null
    }
    return sessao
  } catch {
    clearSession()
    return null
  }
}

export function setSession(sessao: Session) {
  localStorage.setItem(CHAVE, JSON.stringify(sessao))
  window.dispatchEvent(new Event('arenahub:session-changed'))
}

export function clearSession() {
  localStorage.removeItem(CHAVE)
  localStorage.removeItem('arena_user_logged')
  localStorage.removeItem('arena_user_name')
  window.dispatchEvent(new Event('arenahub:session-changed'))
}
