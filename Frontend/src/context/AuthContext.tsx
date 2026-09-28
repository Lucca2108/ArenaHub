'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { LoginInput, RegisterInput, Session, User } from '@/types'
import { api } from '@/services/api'
import { clearSession, getSession, setSession } from '@/services/session'

// Contexto = um "estado global". Qualquer tela pode saber quem está logado usando useAuth().

interface AuthInfo {
  user: User | null
  carregado: boolean // já leu a sessão salva no navegador?
  login(dados: LoginInput): Promise<User>
  register(dados: RegisterInput): Promise<User>
  logout(): void
}

const AuthContext = createContext<AuthInfo | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [carregado, setCarregado] = useState(false)

  // O Next monta a página primeiro no servidor, onde não existe localStorage.
  // Por isso a sessão salva só é lida aqui, quando a página já está no navegador.
  useEffect(() => {
    setSessao(getSession())
    setCarregado(true)
  }, [])

  async function login(dados: LoginInput) {
    const resultado = await api.auth.login(dados)
    setSession(resultado) // salva no localStorage
    setSessao(resultado) // atualiza a tela
    return resultado.user
  }

  async function register(dados: RegisterInput) {
    await api.auth.register(dados)
    // depois de criar a conta, já entra direto
    return login({ email: dados.email, senha: dados.senha })
  }

  function logout() {
    clearSession()
    setSessao(null)
  }

  const user = sessao ? sessao.user : null

  return <AuthContext.Provider value={{ user, carregado, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthInfo {
  const info = useContext(AuthContext)
  if (!info) throw new Error('useAuth precisa estar dentro do <AuthProvider>')
  return info
}
