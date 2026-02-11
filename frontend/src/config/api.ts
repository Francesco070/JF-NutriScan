// frontend/src/config/api.ts
export const getApiBaseUrl = (): string => {
    // Prüfe ob VITE_API_BASE_URL gesetzt ist
    if (import.meta.env.VITE_API_BASE_URL) {
        return import.meta.env.VITE_API_BASE_URL
    }

    // Automatische Erkennung basierend auf window.location
    const { protocol, hostname } = window.location

    // Lokale Entwicklung
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://172.29.3.172:3000/api'
    }

    // Production (gleiche Domain wie Frontend)
    return `${protocol}//${hostname}/api`
}

export const API_CONFIG = {
    baseUrl: getApiBaseUrl(),
    timeout: 10000,
}

// Helper zum Erstellen vollständiger URLs
export const createApiUrl = (endpoint: string): string => {
    const base = API_CONFIG.baseUrl.replace(/\/$/, '') // Remove trailing slash
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${base}${path}`
}