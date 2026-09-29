import { redirect } from 'next/navigation'

// Página inicial "/". Por enquanto manda para o painel do organizador.
// As telas públicas (tabela, calendário, classificação) do Vitor entram aqui.
export default function Home() {
  redirect('/admin')
}
