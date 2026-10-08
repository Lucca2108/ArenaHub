'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';
import { Trophy, Shield } from 'lucide-react';

export default function UserHubPage() {
  const router = useRouter();

  // Verifica se o utilizador está logado ao carregar a página
  useEffect(() => {
    const isLogged = localStorage.getItem('arena_user_logged');
    if (!isLogged) {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arena_user_logged');
    localStorage.removeItem('arena_user_name');
    router.push('/login');
  };

  const minhasEquipes = [
    { id: 1, nome: 'Shadow Gaming', jogo: 'VALORANT', funcao: 'Capitão', membros: 5 },
    { id: 2, nome: 'Apex Red', jogo: 'Counter-Strike 2', funcao: 'Player', membros: 5 },
  ];

  const minhasInscricoes = [
    { id: 1, campeonato: 'VCT 2026 Americas Stage 2', status: 'Confirmado', data: '15 Mai' },
    { id: 2, campeonato: 'CS2 Pro League Season 8', status: 'Em Análise', data: '10 Mai' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0b0e14', color: '#f8fafc' }}>
      
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Background />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* NAVBAR SUPERIOR COM "TIMES" ADICIONADO */}
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
              <Link href="/times" style={{ color: '#94a3b8', textDecoration: 'none' }}>Times</Link>
              <Link href="/hub" style={{ color: '#fff', textDecoration: 'none' }}>Hub do Jogador</Link>
            </nav>
          </div>

          <div>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: '#1a2333',
                border: '1px solid #2a374a',
                color: '#f8fafc',
                padding: '8px 20px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
            >
              Sair da Conta
            </button>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL DO HUB */}
        <main style={{ padding: '48px 32px 64px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
          
          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '2px', color: '#7c3aed', textTransform: 'uppercase', marginBottom: '6px' }}>
              — PAINEL EXCLUSIVO
            </div>
            <h1 style={{ fontSize: '30px', fontWeight: 800, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Hub do Jogador
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '14px' }}>
              Gerencie suas equipas, acompanhe suas inscrições em torneios e visualize seus próximos confrontos.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            
            {/* MINHAS EQUIPAS (SEM O BOTÃO DE CRIAR) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                backgroundColor: '#121824',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Shield color="#7c3aed" size={20} />
                  <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Minhas Equipas</h2>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {minhasEquipes.map((eq) => (
                  <div key={eq.id} style={{ backgroundColor: '#0b0e14', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{eq.nome}</h3>
                      <p style={{ fontSize: '12px', color: '#94a3b8' }}>{eq.jogo} • <span style={{ color: '#34d399' }}>{eq.funcao}</span></p>
                    </div>
                    <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: '#121824', padding: '4px 10px', borderRadius: '8px', border: '1px solid #1e293b' }}>
                      {eq.membros} membros
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* INSCRIÇÕES EM TORNEIOS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                backgroundColor: '#121824',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Trophy color="#06b6d4" size={20} />
                  <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Inscrições em Torneios</h2>
                </div>
                <Link href="/campeonatos" style={{ fontSize: '12px', color: '#7c3aed', textDecoration: 'none', fontWeight: 'bold' }}>
                  Explorar Torneios →
                </Link>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {minhasInscricoes.map((insc) => (
                  <div key={insc.id} style={{ backgroundColor: '#0b0e14', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>{insc.campeonato}</h3>
                      <p style={{ fontSize: '12px', color: '#64748b' }}>Início previsto: {insc.data}</p>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '999px', background: insc.status === 'Confirmado' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: insc.status === 'Confirmado' ? '#34d399' : '#eab308', border: insc.status === 'Confirmado' ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(234, 179, 8, 0.3)' }}>
                      {insc.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  );
}