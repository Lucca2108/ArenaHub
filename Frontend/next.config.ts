import type { NextConfig } from 'next'

// Endereço do backend FastAPI
const API_URL = process.env.API_URL || 'http://localhost:8000'

const nextConfig: NextConfig = {
  // Esconde o botão "N" que o Next mostra no canto da tela durante o desenvolvimento
  devIndicators: false,

  // Tudo que o front pede em /api/... o Next repassa para o FastAPI.
  // Assim o navegador fala sempre com o mesmo endereço e não precisa configurar CORS.
  async rewrites() {
    return [{ source: '/api/:caminho*', destination: `${API_URL}/:caminho*` }]
  },
}

export default nextConfig
