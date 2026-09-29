'use client'

import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import type { Match, Team } from '@/types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { api } from '@/services/api'
import { mensagemDoErro } from '@/services/errors'
import { useToast } from '@/context/ToastContext'
import { formatDateTime, fromInputDateTime, toInputDateTime } from '@/utils/format'

type ScheduleModalProps = {
  match: Match
  teamA: Team
  teamB: Team
  onClose: () => void
  onSaved: () => void
}

export function ScheduleModal({ match, teamA, teamB, onClose, onSaved }: ScheduleModalProps) {
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
      setErro(mensagemDoErro(e))
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
