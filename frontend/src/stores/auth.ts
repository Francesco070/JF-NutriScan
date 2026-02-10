// frontend/src/stores/auth.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authAPI, setAuthToken, removeAuthToken, getAuthToken } from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<{ userId: string } | null>(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const initAuth = async () => {
        const token = getAuthToken()
        if (!token) return

        try {
            const { data, error: fetchError } = await authAPI.getMe().execute()

            if (fetchError.value || !data.value) {
                removeAuthToken()
                return
            }

            user.value = data.value
            isAuthenticated.value = true
        } catch (err) {
            removeAuthToken()
        }
    }

    const login = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null

        try {
            const { data, error: fetchError, statusCode } = await authAPI.login(email, password).execute()

            if (fetchError.value || !data.value) {
                error.value = statusCode.value === 401
                    ? 'Ungültige Email oder Passwort'
                    : 'Login fehlgeschlagen'
                return false
            }

            setAuthToken(data.value.token)
            user.value = { userId: data.value.userId }
            isAuthenticated.value = true
            return true
        } catch (err: any) {
            error.value = 'Login fehlgeschlagen'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const register = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null

        try {
            const { data, error: fetchError, statusCode } = await authAPI.register(email, password).execute()

            if (fetchError.value || !data.value) {
                error.value = statusCode.value === 409
                    ? 'Email bereits registriert'
                    : 'Registrierung fehlgeschlagen'
                return false
            }

            // Nach erfolgreicher Registrierung direkt einloggen
            return await login(email, password)
        } catch (err: any) {
            error.value = 'Registrierung fehlgeschlagen'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const logout = () => {
        removeAuthToken()
        user.value = null
        isAuthenticated.value = false
    }

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        initAuth,
        login,
        register,
        logout,
    }
})