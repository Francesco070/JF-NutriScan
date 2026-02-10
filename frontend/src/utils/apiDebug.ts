// frontend/src/utils/apiDebug.ts
import { API_CONFIG, createApiUrl } from '@/config/api'

export const logApiConfig = () => {
    console.group('🔧 API Configuration')
    console.log('Base URL:', API_CONFIG.baseUrl)
    console.log('Environment:', import.meta.env.MODE)
    console.log('Is Development:', import.meta.env.DEV)
    console.log('Is Production:', import.meta.env.PROD)
    console.log('Example URL:', createApiUrl('/auth/login'))
    console.groupEnd()
}

// Im Development-Modus automatisch loggen
if (import.meta.env.DEV) {
    logApiConfig()
}