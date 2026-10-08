'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';

export default function CampeonatosPage() {
  const [busca, setBusca] = useState('');

  const campeonatosMock = [
    {
      id: 1,
      titulo: 'VCT 2026 Americas Stage 2',
      subtitulo: 'ArenaHub Oficial',
      jogo: 'VALORANT',
      status: 'AO VIVO',
      premiacao: '$ 250.000',
    },
    {
      id: 2,
      titulo: 'CS2 Pro League Season 8',
      subtitulo: 'Liga Sul-Americana de CS',
      jogo: 'COUNTER-STRIKE 2',
      status: 'EM ANDAMENTO',
      premiacao: '$ 50.000',
    },
    {
      id: 3,
      titulo: 'LOL Open Cup 2026',
      subtitulo: 'ArenaHub Community',
      jogo: 'LEAGUE OF LEGENDS',
      status: 'INSCRIÇÕES ABERTAS',
      premiacao: '$ 10.000',
    },
    {
      id: 4,
      titulo: 'R6 South American Cup 2026',
      subtitulo: 'Ubisoft / ArenaHub',
      jogo: 'RAINBOW SIX SIEGE',
      status: 'PRÓXIMO',
      premiacao: '$ 20.000',
    },
  ];

  const campeonatosFiltrados = campeonatosMock.filter((camp) =>
    camp.titulo.toLowerCase().includes(busca.toLowerCase()) ||
    camp.jogo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0b0e14', color: '#f8fafc' }}>
      
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Background />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
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
              <Link href="/campeonatos" style={{ color: '#fff', textDecoration: 'none' }}>Campeonatos</Link>
              <Link href="/jogos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Jogos</Link>
              <Link href="/times" style={{ color: '#94a3b8', textDecoration: 'none' }}>Times</Link>
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
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)',
                transition: 'all 0.2s'
              }}
            >
              Entrar / Cadastrar
            </Link>
          </div>
        </header>

        <main style={{ padding: '48px 32px 64px 32px', maxWidth: '1300px', margin: '0 auto', width: '100%', flex: 1 }}>
          
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', color: '#06b6d4', textTransform: 'uppercase', marginBottom: '6px' }}>
                — COMPETIÇÕES
              </div>
              <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                Todos os Campeonatos
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>
                Explora os torneios ativos, consulta regulamentos e acompanha as chaves de eliminatórias.
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder="Pesquisar campeonato ou jogo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#121824',
                  border: '1px solid #1e293b',
                  borderRadius: '10px',
                  padding: '10px 14px 10px 36px',
                  fontSize: '13px',
                  color: '#fff',
                  outline: 'none',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}
              />
              <span style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b', fontSize: '14px' }}>
                🔍
              </span>
            </div>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
            {campeonatosFiltrados.map((camp, indice) => (
              <motion.div
                key={camp.id}
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
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(124, 58, 237, 0.2)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.4)' }}>
                      {camp.status}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {camp.jogo}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '19px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                    {camp.titulo}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '24px' }}>
                    {camp.subtitulo}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '2px' }}>Premiação</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: '#34d399' }}>{camp.premiacao}</div>
                  </div>

                  <Link
                    href={`/campeonatos/${camp.id}`}
                    style={{
                      backgroundColor: '#7c3aed',
                      color: '#fff',
                      padding: '8px 18px',
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
                    Ver detalhes →
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