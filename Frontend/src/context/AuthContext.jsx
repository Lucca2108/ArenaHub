import { createContext, useContext, useState } from 'react'
import { api } from '../services/api'
import { clearSession, getSession, setSession } from '../services/session'

// Contexto = um "estado global". Qualquer tela pode saber quem está logado usando useAuth().
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // Começa com a sessão salva no navegador (se a pessoa já tinha feito login antes)
  const [sessao, setSessao] = useState(getSession())

  async function login(dados) {
    const resultado = await api.auth.login(dados)
    setSession(resultado) // salva no localStorage
    setSessao(resultado) // atualiza a tela
    return resultado.user
  }

  async function register(dados) {
    await api.auth.register(dados)
    // depois de criar a conta, já entra direto
    return login({ email: dados.email, senha: dados.senha })
  }

  function logout() {
    clearSession()
    setSessao(null)
  }

  const user = sessao ? sessao.user : null

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
