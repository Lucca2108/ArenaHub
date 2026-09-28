'use client'

import { MotionConfig } from 'framer-motion'
import { AuthProvider } from '@/context/AuthContext'
import { ToastProvider } from '@/context/ToastContext'

// Os "providers" deixam o login e os avisos disponíveis para todas as páginas.
// MotionConfig reducedMotion="user": respeita quem pediu menos animações no sistema operacional.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </MotionConfig>
  )
}
