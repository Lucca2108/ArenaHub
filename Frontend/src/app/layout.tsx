import type { Metadata, Viewport } from 'next'
import '@fontsource/orbitron/600.css'
import '@fontsource/orbitron/800.css'
import '@fontsource/orbitron/900.css'
import '@fontsource/rajdhani/500.css'
import '@fontsource/rajdhani/600.css'
import '@fontsource/rajdhani/700.css'
import '@fontsource-variable/inter'
import '@/styles/base.css'
import '@/styles/layout.css'
import '@/styles/components.css'
import '@/styles/pages.css'
import { Providers } from './providers'

// Título da aba do navegador e ícone
export const metadata: Metadata = {
  title: 'ArenaHub · Painel do Organizador',
  icons: '/favicon.svg',
}

export const viewport: Viewport = {
  themeColor: '#05060d',
}

// Layout raiz: envolve TODAS as páginas do site (organizador e, no futuro, as páginas públicas)
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
