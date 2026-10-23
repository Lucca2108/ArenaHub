'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Protege as telas do organizador: quem não fez login é mandado para a tela de login
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, carregado } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (carregado && !user) router.replace('/login')
    if (carregado && user && user.role !== 'organizador') router.replace('/hub')
  }, [carregado, user, router])

  // enquanto não sabe se está logado (ou enquanto redireciona), não mostra nada
  if (!carregado || !user || user.role !== 'organizador') return null
  return children
}
