'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Swords, Trophy, User, Users, Zap } from 'lucide-react'
import { Background } from '@/components/layout/Background'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Tabs } from '@/components/ui/Tabs'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { IS_MOCK } from '@/services/config'
import { mensagemDoErro } from '@/services/errors'
import { GAMES } from '@/utils/constants'
import type { User as Usuario } from '@/types'

const DEMO_EMAIL = 'organizador@arenahub.gg'
const DEMO_SENHA = 'arena123'

const RECURSOS = [
  { icon: Trophy, titulo: 'Campeonatos', texto: 'Pontos corridos ou mata-mata em poucos cliques.' },
  { icon: Users, titulo: 'Equipes', texto: 'Elencos, capitães e escudos personalizados.' },
  { icon: Swords, titulo: 'Partidas ao vivo', texto: 'Agende, inicie e registre placares em tempo real.' },
]

// Verifica se o texto tem cara de e-mail: algo@algo.algo
function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

interface Erros {
  nome?: string
  email?: string
  senha?: string
}

// Página /admin/login
export default function LoginPage() {
  const { user, login, register } = useAuth()
  const toast = useToast()
  const router = useRouter()

  const [modo, setModo] = useState('login') // 'login' ou 'cadastro'
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erros, setErros] = useState<Erros>({})
  const [erroServidor, setErroServidor] = useState('')
  const [carregando, setCarregando] = useState(false)

  // Se já está logado, não precisa ver o login: vai direto para o painel
  useEffect(() => {
    if (user) router.replace('/admin')
  }, [user, router])

  function trocarModo(novoModo: string) {
    setModo(novoModo)
    setErros({})
    setErroServidor('')
  }

  function validar(): boolean {
    const novosErros: Erros = {}
    if (modo === 'cadastro' && nome.trim().length < 2) novosErros.nome = 'Informe seu nome.'
    if (!emailValido(email.trim())) novosErros.email = 'E-mail inválido.'
    if (modo === 'cadastro' && senha.length < 6) novosErros.senha = 'Mínimo de 6 caracteres.'
    if (modo === 'login' && senha === '') novosErros.senha = 'Informe a senha.'
    setErros(novosErros)
    return Object.keys(novosErros).length === 0
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault() // impede o navegador de recarregar a página
    if (!validar()) return

    setCarregando(true)
    setErroServidor('')
    try {
      const dados = { nome: nome.trim(), email: email.trim(), senha }
      let usuario: Usuario
      if (modo === 'login') usuario = await login(dados)
      else usuario = await register(dados)

      toast.success(`GG, ${usuario.nome.split(' ')[0]}!`, 'Bem-vindo ao painel do organizador.')
      router.push('/admin')
    } catch (e) {
      // ex.: "E-mail ou senha inválidos." vindo da API
      setErroServidor(mensagemDoErro(e))
      setCarregando(false)
    }
  }

  function preencherDemo() {
    setEmail(DEMO_EMAIL)
    setSenha(DEMO_SENHA)
    setErros({})
  }

  return (
    <div className="login">
      <Background />

      {/* Lado esquerdo: apresentação */}
      <section className="login__hero">
        <BrandMark />

        <div className="login__rings" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>

        <motion.h1 className="login__headline" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          Comande a sua <span className="text-grad text-grad--animated">arena.</span>
        </motion.h1>
        <motion.p className="login__lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          O painel do organizador do ArenaHub: crie campeonatos, monte a tabela e acompanhe cada partida do seu torneio amador.
        </motion.p>

        <ul className="login__features">
          {RECURSOS.map((recurso, indice) => {
            const Icone = recurso.icon
            return (
              <motion.li key={recurso.titulo} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + indice * 0.12 }}>
                <span className="login__feature-icon">
                  <Icone size={20} />
                </span>
                <div>
                  <strong>{recurso.titulo}</strong>
                  <span>{recurso.texto}</span>
                </div>
              </motion.li>
            )
          })}
        </ul>

        {/* Faixa com os nomes dos jogos passando (a lista é repetida 2x para o loop ficar contínuo) */}
        <div className="marquee" aria-hidden="true">
          <div className="marquee__track">
            {[...GAMES, ...GAMES].map((game, i) => (
              <span key={i} style={{ '--game': game.color }}>
                <Zap size={14} /> {game.id}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Lado direito: formulário */}
      <section className="login__panel">
        <motion.div className="login-card neon-ring" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="login-card__head">
            <span className="eyebrow">Acesso restrito</span>
            <h2>{modo === 'login' ? 'Entrar no painel' : 'Criar conta de organizador'}</h2>
          </div>

          <Tabs
            className="login-card__tabs"
            items={[
              { id: 'login', label: 'Entrar' },
              { id: 'cadastro', label: 'Criar conta' },
            ]}
            value={modo}
            onChange={trocarModo}
          />

          <form className="login-card__form" onSubmit={enviar} noValidate>
            {modo === 'cadastro' && (
              <Field label="Nome" icon={User} error={erros.nome}>
                <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" autoComplete="name" />
              </Field>
            )}

            <Field label="E-mail" icon={Mail} error={erros.email}>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" />
            </Field>

            <Field label="Senha" icon={Lock} error={erros.senha}>
              <input
                className="input input--with-action"
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
              />
              <button type="button" className="input-action" onClick={() => setMostrarSenha(!mostrarSenha)} aria-label={mostrarSenha ? 'Esconder senha' : 'Mostrar senha'}>
                {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </Field>

            {erroServidor && <p className="form-error">{erroServidor}</p>}

            <Button type="submit" size="lg" loading={carregando} className="login-card__submit">
              {modo === 'login' ? 'Entrar na arena' : 'Criar conta e entrar'}
              {!carregando && <ArrowRight size={18} />}
            </Button>
          </form>

          {IS_MOCK && modo === 'login' && (
            <div className="demo-hint">
              <span>
                Modo demo: <code>{DEMO_EMAIL}</code> / <code>{DEMO_SENHA}</code>
              </span>
              <button type="button" onClick={preencherDemo}>
                Preencher
              </button>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  )
}
