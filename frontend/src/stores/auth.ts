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

    const isAuthenticated = computed(() => !!token.value && !!user.value)

    // ============= Auth Actions =============

    const setAuthToken = (newToken: string) => {
        token.value = newToken
        localStorage.setItem('auth_token', newToken)
        console.log('🔑 Auth token set')
    }

    const removeAuthToken = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('auth_token')
        console.log('🔑 Auth token removed')
    }

    const fetchUser = async () => {
        try {
            console.log('👤 Fetching user profile...')
            user.value = await authAPI.me()
            console.log('✅ User profile loaded:', user.value)
        } catch (err) {
            console.error('❌ Error fetching user:', err)
            removeAuthToken()
            throw err
        }
    }

    const initAuth = async () => {
        if (isInitialized.value) return

        console.log('🔐 Initializing auth...')

        if (token.value) {
            try {
                await fetchUser()
                console.log('✅ Auth initialized with existing token')
            } catch (err) {
                console.error('❌ Token validation failed')
                removeAuthToken()
            }
        }

        isInitialized.value = true
    }

    const login = async (email: string, password: string) => {
        try {
            console.log('🔐 Logging in...')
            const response = await authAPI.login({ email, password })
            setAuthToken(response.token)
            await fetchUser()
            console.log('✅ Login successful')
        } catch (err: any) {
            console.error('❌ Login failed:', err)
            throw new Error(err.message || 'Login fehlgeschlagen')
        }
    }

    const register = async (userData: {
        email: string
        password: string
        firstname: string
        lastname: string
    }) => {
        try {
            console.log('📝 Registering...')
            await authAPI.register(userData)
            console.log('✅ Registration successful')
            // Auto-login after registration
            await login(userData.email, userData.password)
        } catch (err: any) {
            console.error('❌ Registration failed:', err)
            throw new Error(err.message || 'Registrierung fehlgeschlagen')
        }
    }

    const logout = () => {
        console.log('👋 Logging out...')
        removeAuthToken()
    }

    return {
        // State
        token,
        user,
        isInitialized,

        // Computed
        isAuthenticated,

        // Actions
        login,
        register,
        logout,
        initAuth,
        fetchUser,
        setAuthToken,
        removeAuthToken,
    }
})