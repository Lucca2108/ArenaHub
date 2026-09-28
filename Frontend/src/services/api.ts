import type { Api } from '@/types'
import { IS_MOCK } from './config'
import { mockApi } from './mockApi'
import { httpApi } from './httpApi'

// As telas só importam `api`. Trocar entre dados de exemplo e backend real
// é só mudar NEXT_PUBLIC_DATA_MODE no arquivo .env
export const api: Api = IS_MOCK ? mockApi : httpApi
