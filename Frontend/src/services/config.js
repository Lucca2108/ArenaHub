// VITE_DATA_MODE=mock (padrão) usa localStorage; VITE_DATA_MODE=api usa o FastAPI via proxy /api
export const DATA_MODE = (import.meta.env.VITE_DATA_MODE || 'mock').toLowerCase() === 'api' ? 'api' : 'mock'
export const IS_MOCK = DATA_MODE === 'mock'
export const API_BASE = '/api'
