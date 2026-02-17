import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {authAPI} from '@/services/api'

interface User {
    firstname: string
    lastname: string
    email: string
    profileImage?: string
}

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('auth_token'))
    const user = ref<User | null>(null)
    const isInitialized = ref(false)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const isAuthenticated = computed(() => !!token.value && !!user.value)

    // ============= Auth Actions =============

    const setAuthToken = (newToken: string) => {
        token.value = newToken
        localStorage.setItem('auth_token', newToken)
    }

    const removeAuthToken = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('auth_token')
    }

    const fetchUser = async () => {
        try {
            user.value = await authAPI.me()
        } catch (err) {
            removeAuthToken()
            throw err
        }
    }

    const initAuth = async () => {
        if (isInitialized.value) return

        if (token.value) {
            try {
                await fetchUser()
            } catch (err) {
                removeAuthToken()
            }
        }

        isInitialized.value = true
    }

    const login = async (email: string, password: string) => {
        isLoading.value = true
        error.value = null

        try {
            const response = await authAPI.login({ email, password })
            setAuthToken(response.token)
            await fetchUser()
            return true
        } catch (err: any) {
            error.value = err.message || 'Login fehlgeschlagen'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const register = async (userData: {
        email: string
        password: string
        firstname: string
        lastname: string
    }) => {
        isLoading.value = true
        error.value = null

        try {
            await authAPI.register(userData)
            // Auto-login after registration
            return await login(userData.email, userData.password)
        } catch (err: any) {
            error.value = err.message || 'Registrierung fehlgeschlagen'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const updateProfile = async (userData: {
        firstname?: string
        lastname?: string
        email?: string
        password?: string
    }) => {
        isLoading.value = true
        error.value = null

        try {
            await authAPI.updateProfile(userData)
            await fetchUser() // Reload user data
            return true
        } catch (err: any) {
            error.value = err.message || 'Update fehlgeschlagen'
            return false
        } finally {
            isLoading.value = false
        }
    }

    const logout = () => {
        removeAuthToken()
    }

    return {
        // State
        token,
        user,
        isInitialized,
        isLoading,
        error,

        // Computed
        isAuthenticated,

        // Actions
        login,
        register,
        logout,
        initAuth,
        fetchUser,
        updateProfile,
        setAuthToken,
        removeAuthToken,
    }
})