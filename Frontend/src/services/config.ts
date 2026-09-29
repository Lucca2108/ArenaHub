// NEXT_PUBLIC_DATA_MODE=mock (padrão) usa dados de exemplo; NEXT_PUBLIC_DATA_MODE=api usa o FastAPI.
// (variáveis que começam com NEXT_PUBLIC_ podem ser lidas no navegador)
export const IS_MOCK = process.env.NEXT_PUBLIC_DATA_MODE !== 'api'

// O next.config.ts repassa tudo que começa com /api para o backend
export const API_BASE = '/api'
