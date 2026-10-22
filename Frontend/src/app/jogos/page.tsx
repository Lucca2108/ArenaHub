'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';

export default function JogosPage() {
  const [jogos, setJogos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8000/tournaments') // ou o endpoint correto dos jogos
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setJogos(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Erro ao buscar jogos:', err);
        setLoading(false);
      });
  }, []);

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
        </header>

        <main style={{ flex: 1, padding: '40px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Jogos Disponíveis</h1>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Consulte os jogos disponíveis na  competição no ArenaHub.</p>
          </div>

          {loading ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>A carregar jogos...</p>
          ) : jogos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#121824', borderRadius: '12px', border: '1px solid #1e293b' }}>
              <p style={{ color: '#94a3b8', fontSize: '15px' }}>Nenhum jogo encontrado.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {jogos.map((jogo, index) => (
                <div key={index} style={{ backgroundColor: '#121824', border: '1px solid #1e293b', borderRadius: '12px', padding: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>{jogo.nome || jogo.title || 'Jogo'}</h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>{jogo.descricao || 'Competições ativas na plataforma.'}</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}