import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

// Modal de "Tem certeza?" usado antes de excluir ou de ações que não dá para desfazer
export function ConfirmDialog({ title, children, confirmLabel = 'Confirmar', tone = 'danger', icon = TriangleAlert, onConfirm, onClose }) {
  const [carregando, setCarregando] = useState(false)

  async function confirmar() {
    setCarregando(true)
    await onConfirm()
    setCarregando(false)
  }

  return (
    <Modal
      title={title}
      icon={icon}
      size="sm"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={carregando}>
            Cancelar
          </Button>
          <Button variant={tone} onClick={confirmar} loading={carregando}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm-text">{children}</div>
    </Modal>
  )
}
