import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { AdminLayout } from './components/layout/AdminLayout'
import { RequireAuth } from './components/layout/RequireAuth'
import { Login } from './pages/admin/Login'
import { Dashboard } from './pages/admin/Dashboard'
import { Tournaments } from './pages/admin/Tournaments'
import { TournamentDetail } from './pages/admin/TournamentDetail'
import { Teams } from './pages/admin/Teams'
import { Matches } from './pages/admin/Matches'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Área pública (tabela, calendário, classificação) fica com o time do front público. */}
              <Route path="/" element={<Navigate to="/admin" replace />} />

              {/* Área do organizador */}
              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin"
                element={
                  <RequireAuth>
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="campeonatos" element={<Tournaments />} />
                <Route path="campeonatos/:id" element={<TournamentDetail />} />
                <Route path="equipes" element={<Teams />} />
                <Route path="partidas" element={<Matches />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </MotionConfig>
  )
}
