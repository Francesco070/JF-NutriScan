// frontend/src/composables/useApi.ts
import {ref, type Ref, unref} from 'vue'
import {authAPI, productsAPI} from '@/services/api'

export function useApi<T = any>(
    endpoint: string | Ref<string>,
    options: RequestInit = {}
) {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const data = ref<T | null>(null)

    const execute = async () => {
        isLoading.value = true
        error.value = null

        try {
            const url = unref(endpoint)

            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}))
                error.value = errorData.error || `HTTP error! status: ${response.status}`
                return null
            }

            const result = await response.json()
            data.value = result
            return result

        } catch (err: any) {
            error.value = err?.message || 'Netzwerkfehler'
            return null
        } finally {
            isLoading.value = false
        }
    }

    return {
        data,
        isLoading,
        error,
        execute,
    }
}

// Spezifische Composables für Auth
export function useAuth() {
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const register = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null

        try {
            return await authAPI.register(email, password)
        } catch (err: any) {
            error.value = err.message || 'Registrierung fehlgeschlagen'
            return null
        } finally {
            isLoading.value = false
        }
    }

    const login = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null

        try {
            return await authAPI.login(email, password)
        } catch (err: any) {
            error.value = err.message || 'Login fehlgeschlagen'
            return null
        } finally {
            isLoading.value = false
        }
    }

    const getMe = async () => {
        isLoading.value = true
        error.value = null

        try {
            return await authAPI.getMe()
        } catch (err: any) {
            error.value = err.message || 'Fehler beim Laden der Benutzerdaten'
            return null
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        register,
        login,
        getMe,
    }
}

// Spezifisches Composable für Products
export function useProducts() {
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const getByBarcode = async (barcode: string) => {
        isLoading.value = true
        error.value = null

        try {
            return await productsAPI.getByBarcode(barcode)
        } catch (err: any) {
            error.value = err.message || 'Produkt konnte nicht geladen werden'
            return null
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        getByBarcode,
    }
}