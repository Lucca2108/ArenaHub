import { createContext, useContext, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'

// Avisos que aparecem no canto da tela ("toasts"). Uso: toast.success('Título', 'texto')
const ToastContext = createContext(null)

const ICONES = { success: CircleCheck, error: CircleAlert, info: Info }
const DURACAO = 4000 // milissegundos

export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([])

  function remover(id) {
    setAvisos((lista) => lista.filter((aviso) => aviso.id !== id))
  }

  function mostrar(tipo, titulo, texto) {
    const id = Date.now() + Math.random()
    setAvisos((lista) => [...lista, { id, tipo, titulo, texto }])
    setTimeout(() => remover(id), DURACAO) // some sozinho depois de 4 segundos
  }

  const toast = {
    success: (titulo, texto) => mostrar('success', titulo, texto),
    error: (titulo, texto) => mostrar('error', titulo, texto),
    info: (titulo, texto) => mostrar('info', titulo, texto),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {/* AnimatePresence permite animar o aviso também quando ele sai da tela */}
        <AnimatePresence>
          {avisos.map((aviso) => {
            const Icone = ICONES[aviso.tipo]
            return (
              <motion.div
                key={aviso.id}
                className={`toast toast--${aviso.tipo}`}
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 80 }}
              >
                <Icone size={20} className="toast__icon" />
                <div className="toast__body">
                  <strong>{aviso.titulo}</strong>
                  {aviso.texto && <span>{aviso.texto}</span>}
                </div>
                <button className="toast__close" onClick={() => remover(aviso.id)} aria-label="Fechar aviso">
                  <X size={16} />
                </button>
                <span className="toast__timer" style={{ animationDuration: `${DURACAO}ms` }} />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
