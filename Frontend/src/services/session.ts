import type { Session } from '@/types'

// A sessão (token + usuário) fica salva no localStorage do navegador,
// para a pessoa continuar logada mesmo depois de recarregar a página.
const CHAVE = 'arenahub:session'

export function getSession(): Session | null {
  const salvo = localStorage.getItem(CHAVE)
  return salvo ? JSON.parse(salvo) : null
}

export function setSession(sessao: Session) {
  localStorage.setItem(CHAVE, JSON.stringify(sessao))
}

export function clearSession() {
  localStorage.removeItem(CHAVE)
}
