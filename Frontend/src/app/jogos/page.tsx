'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';
import { ArrowRight } from 'lucide-react';

export default function JogosPage() {
  const jogos = [
    {
      id: 'valorant',
      nome: 'VALORANT',
      desenvolvedora: 'Riot Games',
      genero: 'Tático FPS',
      torneiosAtivos: 2,
      descricao: 'O popular jogo de tiro tático 5v5 focado em personagens com habilidades únicas.',
      corDestaque: '#ff4655',
      imagemBg: 'rgba(255, 70, 85, 0.1)',
    },
    {
      id: 'cs2',
      nome: 'Counter-Strike 2',
      desenvolvedora: 'Valve',
      genero: 'FPS Clássico',
      torneiosAtivos: 1,
      descricao: 'A evolução do maior jogo de tiro competitivo do mundo, com gráficos renovados e tickrate sub-tick.',
      corDestaque: '#de9b3b',
      imagemBg: 'rgba(222, 155, 59, 0.1)',
    },
    {
      id: 'lol',
      nome: 'League of Legends',
      desenvolvedora: 'Riot Games',
      genero: 'MOBA',
      torneiosAtivos: 1,
      descricao: 'O clássico jogo de estratégia onde duas equipas de cinco campeões batalham para destruir a base inimiga.',
      corDestaque: '#c8aa6e',
      imagemBg: 'rgba(200, 170, 110, 0.1)',
    },
    {
      id: 'r6',
      nome: 'Rainbow Six Siege',
      desenvolvedora: 'Ubisoft',
      genero: 'Tático / Destruição',
      torneiosAtivos: 1,
      descricao: 'Combates táticos intensos em ambientes altamente destrutíveis e planeamento estratégico.',
      corDestaque: '#0055ff',
      imagemBg: 'rgba(0, 85, 255, 0.1)',
    },
  ];

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
              <Link href="/campeonatos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Campeonatos</Link>
              <Link href="/jogos" style={{ color: '#fff', textDecoration: 'none' }}>Jogos</Link>
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
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.4)'
              }}
            >
              Entrar / Cadastrar
            </Link>
          </div>
        </header>

        <main style={{ padding: '48px 32px 64px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
          
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ marginBottom: '32px' }}
          >
            <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', color: '#06b6d4', textTransform: 'uppercase', marginBottom: '6px' }}>
              — MODALIDADES
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Jogos Suportados
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Conheça as principais franquias de e-sports com campeonatos ativos na plataforma.
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginTop: '32px' }}>
            {jogos.map((jogo, indice) => (
              <motion.div
                key={jogo.id}
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
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', backgroundColor: jogo.corDestaque }} />

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', background: jogo.imagemBg, color: jogo.corDestaque, border: `1px solid ${jogo.corDestaque}40` }}>
                      {jogo.genero}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{jogo.desenvolvedora}</span>
                  </div>

                  <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                    {jogo.nome}
                  </h3>
                  
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', marginBottom: '20px' }}>
                    {jogo.descricao}
                  </p>
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>
                    <strong style={{ color: '#34d399' }}>{jogo.torneiosAtivos}</strong> torneios ativos
                  </span>
                  
                  <Link
                    href={`/campeonatos`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#1a2333',
                      color: '#f8fafc',
                      padding: '8px 14px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      textDecoration: 'none',
                      border: '1px solid #2a374a'
                    }}
                  >
                    Ver torneios <ArrowRight size={14} />
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