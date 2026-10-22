'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';

export default function HubPage() {
  const router = useRouter();
  const [userName, setUserName] = useState('Jogador');

  useEffect(() => {
    const isLogged = localStorage.getItem('arena_user_logged');
    if (!isLogged) {
      router.push('/login');
      return;
    }
    const name = localStorage.getItem('arena_user_name');
    if (name) setUserName(name);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('arena_user_logged');
    localStorage.removeItem('arena_user_name');
    router.push('/login');
  };

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
              <Link href="/jogos" style={{ color: '#94a3b8', textDecoration: 'none' }}>Jogos</Link>
              <Link href="/times" style={{ color: '#94a3b8', textDecoration: 'none' }}>Times</Link>
              <Link href="/hub" style={{ color: '#fff', textDecoration: 'none' }}>Hub do Jogador</Link>
            </nav>
          </div>

          <button
            onClick={handleLogout}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Sair da Conta
          </button>
        </header>

        <main style={{ flex: 1, padding: '40px 32px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '32px', backgroundColor: '#121824', border: '1px solid #1e293b', padding: '30px', borderRadius: '16px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Bem-vindo ao Hub, {userName}!</h1>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Aqui podes gerir as tuas inscrições, equipas e estatísticas nas competições da ArenaHub.</p>
          </div>
        </main>
      </div>
    </div>
  );
}