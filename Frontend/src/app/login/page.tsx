'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Background } from '@/components/layout/Background';
import { BrandMark } from '@/components/layout/BrandMark';
import { setSession } from '@/services/session';

export default function UserLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [nickname, setNickname] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isLogin && senha !== confirmacao) throw new Error('As senhas não coincidem.');
      if (!isLogin && nickname.trim().length < 2) throw new Error('Informe um nickname válido.');
      const endpoint = isLogin ? '/api/auth/login' : '/api/users';
      
      const payload = isLogin 
        ? { email, senha }
        : { 
            nome: nome.trim(),
            nickname: nickname.trim(),
            email: email, 
            senha: senha, 
            role: 'jogador' 
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        let detailMsg = 'Erro ao processar autenticação no servidor.';
        
        if (errData.detail) {
          if (typeof errData.detail === 'string') {
            detailMsg = errData.detail;
          } else if (Array.isArray(errData.detail)) {
            detailMsg = errData.detail.map((errItem: any) => errItem.msg || JSON.stringify(errItem)).join(', ');
          } else if (typeof errData.detail === 'object') {
            detailMsg = JSON.stringify(errData.detail);
          }
        }
        throw new Error(detailMsg);
      }

      let dadosResposta = await response.json();
      if (!isLogin) {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha }),
        });
        if (!loginResponse.ok) throw new Error('Conta criada, mas não foi possível iniciar a sessão.');
        dadosResposta = await loginResponse.json();
      }
      if (dadosResposta.access_token && dadosResposta.user) {
        setSession({ token: dadosResposta.access_token, user: dadosResposta.user });
      }
      
      const destino = dadosResposta.user?.role === 'organizador' ? '/admin' : '/hub';
      router.push(destino);
    } catch (err: any) {
      setError(err.message || 'Erro de ligação à API.');
    } finally {
      setLoading(false);
    }
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
              <Link href="/hub" style={{ color: '#94a3b8', textDecoration: 'none' }}>Hub do Jogador</Link>
            </nav>
          </div>

          <div>
            <Link
              href="/"
              style={{
                color: '#94a3b8',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
            >
              ← Voltar para o Início
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              backgroundColor: '#121824',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '36px',
              width: '100%',
              maxWidth: '420px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6), 0 0 20px rgba(124, 58, 237, 0.1)'
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.5px' }}>
                {isLogin ? 'Aceder à sua conta' : 'Criar Nova Conta'}
              </h1>
              <p style={{ fontSize: '13px', color: '#94a3b8' }}>
                {isLogin ? 'Entre para acompanhar seus torneios e equipas.' : 'Registe-se para participar das competições.'}
              </p>
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '20px' }}>
                {typeof error === 'string' ? error : 'Ocorreu um erro no servidor.'}
              </div>
            )}

            <div style={{ display: 'flex', backgroundColor: '#0b0e14', padding: '4px', borderRadius: '12px', marginBottom: '28px', border: '1px solid #1e293b' }}>
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: isLogin ? '#7c3aed' : 'transparent',
                  color: isLogin ? '#fff' : '#94a3b8',
                  border: 'none',
                  boxShadow: isLogin ? '0 4px 12px rgba(124, 58, 237, 0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  backgroundColor: !isLogin ? '#7c3aed' : 'transparent',
                  color: !isLogin ? '#fff' : '#94a3b8',
                  border: 'none',
                  boxShadow: !isLogin ? '0 4px 12px rgba(124, 58, 237, 0.4)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                Cadastrar
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Nome completo
                  </label>
                  <input
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0b0e14',
                      border: '1px solid #1e293b',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '14px',
                      color: '#fff',
                      outline: 'none',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                    }}
                  />
                </div>
              )}

              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Nickname
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nick nos jogos"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#0b0e14', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#fff', outline: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0e14',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    color: '#fff',
                    outline: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </div>

              {!isLogin && (
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita sua senha"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    style={{ width: '100%', backgroundColor: '#0b0e14', border: '1px solid #1e293b', borderRadius: '10px', padding: '12px 14px', fontSize: '14px', color: '#fff', outline: 'none' }}
                  />
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94a3b8', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Palavra-passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#0b0e14',
                    border: '1px solid #1e293b',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    fontSize: '14px',
                    color: '#fff',
                    outline: 'none',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: '10px',
                  width: '100%',
                  backgroundColor: '#7c3aed',
                  color: '#fff',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                  transition: 'background-color 0.2s'
                }}
              >
                {loading ? 'A processar...' : isLogin ? 'Entrar na Arena' : 'Concluir Registo'}
              </button>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
