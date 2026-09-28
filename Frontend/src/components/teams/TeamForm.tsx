'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Hash, Plus, Save, Shield, X } from 'lucide-react'
import type { Team, TeamInput } from '@/types'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { TeamLogo } from '../ui/TeamLogo'
import { TEAM_COLORS } from '@/utils/constants'
import { makeTag } from '@/utils/format'
import { mensagemDoErro } from '@/services/errors'

const MAX_JOGADORES = 10

type TeamFormProps = {
  team: Team | null // null = criando uma nova
  onClose: () => void
  onSubmit: (dados: TeamInput) => Promise<void>
}

interface Erros {
  nome?: string
  tag?: string
  jogadores?: string
}

// Formulário de criar/editar equipe. Se receber "team", é edição.
export function TeamForm({ team, onClose, onSubmit }: TeamFormProps) {
  const editando = team !== null

  const [nome, setNome] = useState(editando ? team.nome : '')
  const [tag, setTag] = useState(editando ? team.tag : '')
  const [cor, setCor] = useState(editando ? team.cor : TEAM_COLORS[0])
  const [jogadores, setJogadores] = useState<string[]>(editando ? team.jogadores : [])
  const [capitao, setCapitao] = useState(editando ? team.capitao : '')
  const [novoJogador, setNovoJogador] = useState('')
  // enquanto a pessoa não mexer na tag, ela é gerada sozinha a partir do nome
  const [tagEditada, setTagEditada] = useState(editando)

  const [erros, setErros] = useState<Erros>({})
  const [erroServidor, setErroServidor] = useState('')
  const [salvando, setSalvando] = useState(false)

  function mudarNome(valor: string) {
    setNome(valor)
    if (!tagEditada) setTag(makeTag(valor))
  }

  function mudarTag(valor: string) {
    setTagEditada(true)
    setTag(valor.toUpperCase().slice(0, 4))
  }

  function adicionarJogador() {
    const nick = novoJogador.trim()
    if (nick === '') return
    if (jogadores.includes(nick)) {
      setErros({ ...erros, jogadores: 'Esse jogador já está na lista.' })
      return
    }
    if (jogadores.length >= MAX_JOGADORES) {
      setErros({ ...erros, jogadores: `Máximo de ${MAX_JOGADORES} jogadores.` })
      return
    }
    setJogadores([...jogadores, nick])
    if (capitao === '') setCapitao(nick) // o primeiro jogador vira capitão
    setNovoJogador('')
    setErros({ ...erros, jogadores: undefined })
  }

  function removerJogador(nick: string) {
    const restantes = jogadores.filter((j) => j !== nick)
    setJogadores(restantes)
    // se removeu o capitão, o próximo da lista assume
    if (capitao === nick) setCapitao(restantes.length > 0 ? restantes[0] : '')
  }

  function aoApertarTecla(evento: React.KeyboardEvent<HTMLInputElement>) {
    // Enter no campo de jogador adiciona o jogador (em vez de enviar o formulário)
    if (evento.key === 'Enter') {
      evento.preventDefault()
      adicionarJogador()
    }
  }

  function validar(): boolean {
    const novosErros: Erros = {}
    if (nome.trim().length < 2) novosErros.nome = 'Dê um nome à equipe.'
    if (tag.trim() === '') novosErros.tag = 'Informe a tag (sigla).'
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  async function salvar() {
    if (!validar()) return
    setSalvando(true)
    setErroServidor('')
    try {
      await onSubmit({ nome: nome.trim(), tag: tag.trim(), cor, capitao, jogadores })
    } catch (e) {
      setErroServidor(mensagemDoErro(e))
      setSalvando(false)
    }
  }

  return (
    <Modal
      title={editando ? 'Editar equipe' : 'Nova equipe'}
      subtitle={editando ? team.nome : 'Monte o elenco e personalize o escudo.'}
      icon={Shield}
      size="lg"
      onClose={onClose}
      onSubmit={salvar}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} loading={salvando}>
            {editando ? 'Salvar alterações' : 'Cadastrar equipe'}
          </Button>
        </>
      }
    >
      <div className="team-form">
        {/* Prévia do escudo: muda na hora conforme o usuário digita */}
        <div className="team-form__preview" style={{ '--team': cor }}>
          <motion.div key={cor} initial={{ rotate: -12, scale: 0.85 }} animate={{ rotate: 0, scale: 1 }}>
            <TeamLogo team={{ nome: nome || 'Equipe', tag: tag || '?', cor }} size={120} glow />
          </motion.div>
          <strong>{nome || 'Nome da equipe'}</strong>
          <span>{jogadores.length} jogador(es)</span>
        </div>

        <div className="form-grid">
          <Field label="Nome da equipe" error={erros.nome} icon={Shield} className="span-2">
            <input className="input" value={nome} onChange={(e) => mudarNome(e.target.value)} placeholder="Ex.: Nexus Wolves" maxLength={40} autoFocus />
          </Field>

          <Field label="Tag" error={erros.tag} icon={Hash} hint="Sigla exibida no placar">
            <input className="input input--upper" value={tag} onChange={(e) => mudarTag(e.target.value)} placeholder="NXW" maxLength={4} />
          </Field>

          <Field label="Cor" as="div">
            <div className="swatches">
              {TEAM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch ${cor === c ? 'is-active' : ''}`}
                  style={{ '--swatch': c }}
                  onClick={() => setCor(c)}
                  aria-label={`Cor ${c}`}
                />
              ))}
            </div>
          </Field>

          <Field label="Jogadores" as="div" className="span-2" error={erros.jogadores} hint="Clique na coroa para escolher o capitão.">
            <div className="player-input">
              <input
                className="input"
                value={novoJogador}
                onChange={(e) => setNovoJogador(e.target.value)}
                onKeyDown={aoApertarTecla}
                placeholder="Nick do jogador e Enter"
                maxLength={24}
              />
              <Button variant="ghost" icon={Plus} onClick={adicionarJogador}>
                Adicionar
              </Button>
            </div>
            <ul className="player-list">
              {jogadores.map((nick) => (
                <motion.li key={nick} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} className={`player-chip ${capitao === nick ? 'is-captain' : ''}`}>
                  <button type="button" className="player-chip__crown" onClick={() => setCapitao(nick)} aria-label={`Tornar ${nick} capitão`} title="Capitão">
                    <Crown size={14} />
                  </button>
                  <span>{nick}</span>
                  <button type="button" className="player-chip__remove" onClick={() => removerJogador(nick)} aria-label={`Remover ${nick}`}>
                    <X size={14} />
                  </button>
                </motion.li>
              ))}
            </ul>
          </Field>
        </div>
      </div>

      {erroServidor && <p className="form-error">{erroServidor}</p>}
    </Modal>
  )
}
