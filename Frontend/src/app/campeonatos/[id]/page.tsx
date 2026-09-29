'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';
import { Trophy, Users, Calendar, Shield, ArrowLeft } from 'lucide-react';

export default function CampeonatoDetalhesPage() {
  const params = useParams();
  const campeonatoId = params?.id || '1';
  
  const [abaAtiva, setAbaAtiva] = useState<'geral' | 'chaveamento' | 'equipas'>('geral');

  const campeonato = {
    id: campeonatoId,
    titulo: 'VCT 2026 Americas Stage 2',
    subtitulo: 'ArenaHub Oficial • Etapa Principal',
    jogo: 'VALORANT',
    status: 'AO VIVO',
    premiacao: '$ 250.000',
    dataInicio: '15 de Maio de 2026',
    formato: 'Eliminatória Dupla (MD3 / MD5 na Final)',
    participantes: '16 Equipas',
    descricao: 'O VCT 2026 Americas Stage 2 reúne as principais organizações da região na luta pela qualificação direta para o mundial. Preparem as vossas estratégias e dominem os mapas.',
    equipasInscritas: [
      { id: 1, nome: 'Shadow Gaming', tag: 'SHDW', status: 'Confirmado' },
      { id: 2, nome: 'Apex Red', tag: 'APEX', status: 'Confirmado' },
      { id: 3, nome: 'Nova Esports', tag: 'NOVA', status: 'Confirmado' },
      { id: 4, nome: 'CyberTitans', tag: 'TTNS', status: 'Confirmado' },
    ],
    confrontos: [
      { id: 1, fase: 'Quartas de Final', t1: 'Shadow Gaming', t2: 'Apex Red', placar: '2 - 1', status: 'Finalizado' },
      { id: 2, fase: 'Quartas de Final', t1: 'Nova Esports', t2: 'CyberTitans', placar: '2 - 0', status: 'Finalizado' },
      { id: 3, fase: 'Semifinal', t1: 'Shadow Gaming', t2: 'Nova Esports', placar: 'A definir', status: 'Próximo' },
    ]
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0b0e14', color: '#f8fafc' }}>
      
      {/* Background Fixo Global */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, pointerEvents: 'none' }}>
        <Background />
      </div>

      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* NAVBAR SUPERIOR PÚBLICA */}
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

        {/* CONTEÚDO PRINCIPAL */}
        <main style={{ padding: '48px 32px 64px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
          
          <div style={{ marginBottom: '24px' }}>
            <Link href="/campeonatos" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', fontWeight: 600, textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Voltar para Campeonatos
            </Link>
          </div>

          {/* HERO DO CAMPEONATO (ESTRUTURA DE VITRINE / ANÁLISE) */}
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

            <div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(124, 58, 237, 0.2)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.4)' }}>
                  {campeonato.status}
                </span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {campeonato.jogo}
                </span>
              </div>

              <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                {campeonato.titulo}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '14px' }}>{campeonato.subtitulo}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #1e293b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Trophy color="#34d399" size={20} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Premiação</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{campeonato.premiacao}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Calendar color="#06b6d4" size={20} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Início</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{campeonato.dataInicio}</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users color="#c084fc" size={20} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Vagas</div>
                  <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{campeonato.participantes}</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ABAS DE NAVEGAÇÃO */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
            <button
              onClick={() => setAbaAtiva('geral')}
              style={{
                backgroundColor: abaAtiva === 'geral' ? '#7c3aed' : 'transparent',
                color: abaAtiva === 'geral' ? '#fff' : '#94a3b8',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setAbaAtiva('chaveamento')}
              style={{
                backgroundColor: abaAtiva === 'chaveamento' ? '#7c3aed' : 'transparent',
                color: abaAtiva === 'chaveamento' ? '#fff' : '#94a3b8',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Chaveamento & Partidas
            </button>
            <button
              onClick={() => setAbaAtiva('equipas')}
              style={{
                backgroundColor: abaAtiva === 'equipas' ? '#7c3aed' : 'transparent',
                color: abaAtiva === 'equipas' ? '#fff' : '#94a3b8',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Equipas Inscritas ({campeonato.equipasInscritas.length})
            </button>
          </div>

          <div style={{ backgroundColor: '#121824', border: '1px solid #1e293b', borderRadius: '16px', padding: '28px' }}>
            {abaAtiva === 'geral' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>Sobre o Torneio</h3>
                <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>{campeonato.descricao}</p>
                <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>Formato da Competição</h4>
                <p style={{ color: '#94a3b8', fontSize: '14px' }}>{campeonato.formato}</p>
              </div>
            )}
            {abaAtiva === 'chaveamento' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>Chaves de Eliminatórias</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {campeonato.confrontos.map((confronto) => (
                    <div key={confronto.id} style={{ backgroundColor: '#0b0e14', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#7c3aed', textTransform: 'uppercase' }}>{confronto.fase}</span>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginTop: '4px' }}>
                          {confronto.t1} <span style={{ color: '#64748b', fontWeight: 'normal' }}>vs</span> {confronto.t2}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#34d399' }}>{confronto.placar}</div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{confronto.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {abaAtiva === 'equipas' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '16px' }}>Line-ups Confirmadas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                  {campeonato.equipasInscritas.map((eq) => (
                    <div key={eq.id} style={{ backgroundColor: '#0b0e14', border: '1px solid #1e293b', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Shield color="#c084fc" size={20} />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{eq.nome}</div>
                        <span style={{ fontSize: '12px', color: '#7c3aed' }}>[{eq.tag}]</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}