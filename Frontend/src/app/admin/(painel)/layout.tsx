import { RequireAuth } from '@/components/layout/RequireAuth'
import { AdminLayout } from '@/components/layout/AdminLayout'

// Layout de todas as páginas dentro de (painel): exige login e mostra menu + topo.
// A pasta "(painel)" fica entre parênteses para NÃO aparecer na URL:
// app/admin/(painel)/equipes/page.tsx vira o endereço /admin/equipes
export default function PainelLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAuth>
      <AdminLayout>{children}</AdminLayout>
    </RequireAuth>
  )
}
