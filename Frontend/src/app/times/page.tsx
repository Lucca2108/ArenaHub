'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';
import { Shield, ArrowRight } from 'lucide-react';

export default function TimesPage() {
  const timesMock = [
    { id: 1, nome: 'Shadow Gaming', jogo: 'VALORANT', tag: 'SHDW', membros: 5, vitorias: 12 },
    { id: 2, nome: 'Apex Red', jogo: 'Counter-Strike 2', tag: 'APEX', membros: 5, vitorias: 9 },
    { id: 3, nome: 'Nova Esports', jogo: 'League of Legends', tag: 'NOVA', membros: 5, vitorias: 15 },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0b0e14', color: '#f8fafc' }}>
      
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Background />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* NAVBAR SUPERIOR */}
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
          
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '32px' }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px' }}>
              — ELENCOS
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Times Registrados
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Consulte as principais equipes, elencos e estatísticas de jogadores na ArenaHub.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px', marginTop: '32px' }}>
            {timesMock.map((time, indice) => (
              <motion.div
                key={time.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: indice * 0.08, duration: 0.3 }}
                style={{
                  backgroundColor: '#121824',
                  border: '1px solid #1e293b',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                    <div style={{ width: '45px', height: '45px', backgroundColor: 'rgba(124, 58, 237, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                      <Shield color="#c084fc" size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: '#fff' }}>{time.nome}</h3>
                      <span style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 600 }}>[{time.tag}] • {time.jogo}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8', marginBottom: '20px' }}>
                    <span>Membros: <strong style={{ color: '#fff' }}>{time.membros}</strong></span>
                    <span>Vitórias: <strong style={{ color: '#34d399' }}>{time.vitorias}</strong></span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Link
                    href={`/times/${time.id}`}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: '#fff',
                      padding: '8px 16px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)'
                    }}
                  >
                    Ver Elenco e Estatísticas <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}