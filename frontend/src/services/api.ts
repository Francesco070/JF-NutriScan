import axios, { AxiosError } from 'axios'
import { useAuthStore } from '@/stores/auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
})

// Request Interceptor - Add Auth Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        console.log('🌐 API Call:', config.url, { method: config.method?.toUpperCase() })
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response Interceptor - Handle 401 Errors
api.interceptors.response.use(
    (response) => {
        console.log('📡 Response status:', response.status)
        return response
    },
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            console.log('🔒 401 Unauthorized - Redirecting to login')
            const authStore = useAuthStore()
            authStore.logout()

            // Redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

// Generic API Call Handler
async function apiCall<T>(
    method: 'get' | 'post' | 'put' | 'delete',
    url: string,
    data?: any
): Promise<T> {
    try {
        const response = await api.request<T>({
            method,
            url,
            data,
        })
        console.log('✅ Response data:', response.data)
        return response.data
    } catch (error: any) {
        console.error('❌ API Error:', error.response?.data || error.message)
        if (error.response?.status === 404) {
            throw new Error('Api error. Try again later.')
        }
        throw new Error(error.response?.data?.message || 'API request failed')
    }
}

// ============= Auth API =============

export const authAPI = {
    register: (userData: { email: string; password: string; firstname: string; lastname: string }) =>
        apiCall<{ userId: string }>('post', '/auth/register', userData),

    login: (credentials: { email: string; password: string }) =>
        apiCall<{ token: string; userId: string }>('post', '/auth/login', credentials),

    me: () =>
        apiCall<{ firstname: string; lastname: string; email: string; profileImage?: string }>('get', '/auth/me'),

    getStats: () =>
        apiCall<{
            totalScans: number
            totalFavorites: number
            healthScoreTrend: Array<{ date: string; score: number | null }>
            nutriScoreDistribution: Array<{ grade: string; count: number; percent: number }>
        }>('get', '/auth/stats'),

    updateProfile: (userData: {
        email?: string
        password?: string
        firstname?: string
        lastname?: string
    }) =>
        apiCall<{ message: string }>('put', '/auth/update', userData),
}

// ============= Products API =============

export const productsAPI = {
    getByBarcode: (barcode: string) =>
        apiCall<{ source: string; product: any }>('get', `/products/${barcode}`),

    create: (productData: any) =>
        apiCall<{ message: string }>('post', '/products', productData),

    delete: (barcode: string) =>
        apiCall<{ message: string }>('delete', `/products/${barcode}`),

    // Favorites
    addToFavorites: (barcode: string) =>
        apiCall<{ message: string }>('post', `/products/favorites/${barcode}`),

    removeFromFavorites: (barcode: string) =>
        apiCall<{ message: string }>('delete', `/products/favorites/${barcode}`),

    getFavorites: () =>
        apiCall<any[]>('get', '/products/favorites'),

    checkFavorite: (barcode: string) =>
        apiCall<{ isFavorite: boolean }>('get', `/products/favorites/${barcode}/check`),

    // History
    addToHistory: (barcode: string) =>
        apiCall<{ message: string }>('post', `/products/history/${barcode}`),

    getHistory: () =>
        apiCall<any[]>('get', '/products/history'),
}

export default api