import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { formatDateTime, fromInputDateTime, toInputDateTime } from '../../utils/format'

export function ScheduleModal({ match, teamA, teamB, onClose, onSaved }) {
  const toast = useToast()
  // o campo começa com a data atual da partida (se já tiver uma)
  const [dataHora, setDataHora] = useState(toInputDateTime(match.data_hora))
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  async function salvar() {
    if (!dataHora) {
      setErro('Escolha data e horário.')
      return
    }
    setSalvando(true)
    try {
      const iso = fromInputDateTime(dataHora)
      await api.matches.schedule(match.id, iso)
      toast.success('Partida agendada', `${teamA.nome} x ${teamB.nome} · ${formatDateTime(iso)}`)
      onSaved()
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      title="Agendar partida"
      subtitle={`${teamA.nome} x ${teamB.nome}`}
      icon={CalendarClock}
      size="sm"
      onClose={onClose}
      onSubmit={salvar}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={CalendarClock} loading={salvando}>
            Salvar horário
          </Button>
        </>
      }
    >
      <Field label="Data e horário" error={erro} icon={CalendarClock}>
        <input className="input" type="datetime-local" value={dataHora} onChange={(e) => setDataHora(e.target.value)} autoFocus />
      </Field>
    </Modal>
  )
}
