// frontend/src/stores/auth.ts
import {defineStore} from 'pinia'
import {ref} from 'vue'
import {authAPI, getAuthToken, removeAuthToken, setAuthToken} from '@/services/api'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<{ userId: string; email?: string; firstname?: string; lastname?: string } | null>(null)
    const isAuthenticated = ref(false)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const initAuth = async () => {
        const token = getAuthToken()
        if (!token) return

        try {
            user.value = await authAPI.getMe()
            isAuthenticated.value = true
        } catch (err) {
            removeAuthToken()
        }
    }

    const login = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null

        try {
            console.log('🔐 Logging in:', email)
            const response = await authAPI.login(email, password)

            console.log('✅ Login response:', response)

            setAuthToken(response.token)
            user.value = {
                userId: response.userId,
                email: response.email,
                firstname: response.firstname,
                lastname: response.lastname
            }
            isAuthenticated.value = true
            return true
        } catch (err: any) {
            console.error('❌ Login error:', err)
            error.value = err.message || 'Login fehlgeschlagen'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const register = async (
        firstname: string,
        lastname: string,
        email: string,
        password: string
    ) => {
        isLoading.value = true
        error.value = null

        try {
            console.log('📝 Registering:', { firstname: firstname, lastname: lastname, email })
            await authAPI.register(firstname, lastname, email, password)

            console.log('✅ Registration successful, logging in...')

            // Nach erfolgreicher Registrierung direkt einloggen
            return await login(email, password)
        } catch (err: any) {
            console.error('❌ Registration error:', err)
            error.value = err.message || 'Registrierung fehlgeschlagen'
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