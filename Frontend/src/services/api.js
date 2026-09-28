import { IS_MOCK } from './config'
import { mockApi } from './mockApi'
import { httpApi } from './httpApi'

// As telas só importam `api`; trocar entre mock e backend real é só mudar VITE_DATA_MODE.
export const api = IS_MOCK ? mockApi : httpApi
