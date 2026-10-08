'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';
import { Shield, ArrowLeft, Trophy, User } from 'lucide-react';

export default function TimeDetalhesPage() {
  const params = useParams();
  const timeId = params?.id || '1';

  // Mock detalhado do time e estatísticas individuais dos jogadores
  const time = {
    id: timeId,
    nome: 'Shadow Gaming',
    tag: 'SHDW',
    jogo: 'VALORANT',
    vitorias: 12,
    derrotas: 3,
    rankingRegional: '#2 da Região',
    jogadores: [
      { id: 1, nick: 'vTz', funcao: 'Duelista', kda: '1.35', hs: '42%', rating: '1.28' },
      { id: 2, nick: 'Sacyr', funcao: 'Iniciador', kda: '1.15', hs: '28%', rating: '1.10' },
      { id: 3, nick: 'Nox', funcao: 'Controlador', kda: '1.05', hs: '25%', rating: '1.02' },
      { id: 4, nick: 'Zeus', funcao: 'Sentinela', kda: '1.10', hs: '31%', rating: '1.08' },
      { id: 5, nick: 'Kuro', funcao: 'IGL / Smokes', kda: '0.98', hs: '22%', rating: '0.96' },
    ]
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0b0e14', color: '#f8fafc' }}>
      
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Background />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* NAVBAR */}
        <header style={{
          borderBottom: '1px solid #1e293b',
          backgroundColor: 'rgba(15, 20, 30, 0.9)',
          backdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <BrandMark />
            <nav style={{ display: 'flex', gap: '24px', fontSize: '14px', fontWeight: 500, color: '#94a3b8' }}>
              <Link href="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Início</Link>
              <Link href="/campeonatos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Campeonatos</Link>
              <Link href="/jogos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Jogos</Link>
              <Link href="/times" style={{ color: '#fff', textDecoration: 'none' }}>Times</Link>
              <Link href="/hub" style={{ color: '#94a3b8', textDecoration: 'none' }}>Hub do Jogador</Link>
            </nav>
          </div>

          <div>
            <Link
              href="/login"
              style={{
                backgroundColor: '#7c3aed',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
              }}
            >
              Entrar / Cadastrar
            </Link>
          </div>
        </header>

        {/* CONTEÚDO */}
        <main style={{ padding: '48px 32px 64px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
          
          <div style={{ marginBottom: '24px' }}>
            <Link href="/times" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Voltar para Times
            </Link>
          </div>

          {/* CABEÇALHO DO TIME */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              backgroundColor: '#121824',
              border: '1px solid #1e293b',
              borderRadius: '20px',
              padding: '36px',
              marginBottom: '32px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: 'linear-gradient(90deg, #7c3aed, #06b6d4)' }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
              <div style={{ width: '60px', height: '60px', backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(124, 58, 237, 0.4)' }}>
                <Shield color="#c084fc" size={30} />
              </div>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#7c3aed', textTransform: 'uppercase' }}>[{time.tag}] • {time.jogo}</span>
                <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{time.nome}</h1>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', paddingTop: '20px', borderTop: '1px solid #1e293b' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Campanha</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#34d399' }}>{time.vitorias} V — {time.derrotas} D</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Posição</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#06b6d4' }}>{time.rankingRegional}</div>
              </div>
            </div>
          </motion.div>

          {/* TABELA DE ESTATÍSTICAS DOS JOGADORES */}
          <div style={{ backgroundColor: '#121824', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trophy color="#c084fc" size={20} /> Estatísticas Individuais do Elenco
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {time.jogadores.map((jogador) => (
                <div
                  key={jogador.id}
                  style={{
                    backgroundColor: '#0b0e14',
                    border: '1px solid #1e293b',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', backgroundColor: '#161f30', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #2a374a' }}>
                      <User color="#94a3b8" size={18} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>{jogador.nick}</h3>
                      <span style={{ fontSize: '12px', color: '#06b6d4', fontWeight: 600 }}>{jogador.funcao}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#94a3b8' }}>
                    <div>KDA: <strong style={{ color: '#fff' }}>{jogador.kda}</strong></div>
                    <div>Headshot: <strong style={{ color: '#34d399' }}>{jogador.hs}</strong></div>
                    <div>Rating: <strong style={{ color: '#c084fc' }}>{jogador.rating}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}