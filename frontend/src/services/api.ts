// frontend/src/services/api.ts
import { createApiUrl } from '@/config/api'

// Token-Management
export const getAuthToken = (): string | null => {
    return localStorage.getItem('auth_token')
}

export const setAuthToken = (token: string): void => {
    localStorage.setItem('auth_token', token)
}

export const removeAuthToken = (): void => {
    localStorage.removeItem('auth_token')
}

// Headers erstellen
const getHeaders = (): HeadersInit => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    }

    const token = getAuthToken()
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    return headers
}

// Generic API call
async function apiCall<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = createApiUrl(endpoint)

    console.log('🌐 API Call:', url, options)

    const response = await fetch(url, {
        ...options,
        headers: {
            ...getHeaders(),
            ...options.headers,
        },
    })

    console.log('📡 Response status:', response.status)

    // Check for 401 Unauthorized
    if (response.status === 401) {
        removeAuthToken()
        window.location.href = '/login'
        throw new Error('Unauthorized')
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    console.log('✅ Response data:', data)

    return data
}

// Auth API
export const authAPI = {
    register: async (
        firstName: string,
        lastName: string,
        email: string,
        password: string
    ) => {
        return apiCall<{ userId: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ firstName, lastName, email, password }),
        })
    },

    login: async (email: string, password: string) => {
        return apiCall<{
            token: string
            userId: string
            email: string
            firstName?: string
            lastName?: string
        }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        })
    },

    getMe: async () => {
        return apiCall<{
            userId: string
            email: string
            firstName?: string
            lastName?: string
        }>('/auth/me', {
            method: 'GET',
        })
    },
}

// Products API
export const productsAPI = {
    getByBarcode: async (barcode: string) => {
        return apiCall<{
            source: string
            product: {
                barcode: string
                name: string | null
                brand: string | null
                imageUrl: string | null
                imageIngredientsUrl?: string | null
                imageNutritionUrl?: string | null
                categories?: string | null
                ingredients?: string | null
                allergens?: string | null
                nutriscore?: {
                    grade: string | null
                    score: number | null
                } | null
                serving?: {
                    size: string | null
                    quantity: number | null
                    unitBasis: string | null
                } | null
                nutriments: {
                    energyKj100g: number | null
                    energyKcal100g: number | null
                    energyKcalServing: number | null
                    proteins100g: number | null
                    carbs100g: number | null
                    fat100g: number | null
                    saturatedFat100g: number | null
                    sugars100g: number | null
                    fiber100g: number | null
                    salt100g: number | null
                    sodium100g: number | null
                }
            }
        }>(`/products/${barcode}`, {
            method: 'GET',
        })
    },
}