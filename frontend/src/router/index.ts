import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/scanner',
        name: 'Scanner',
        component: () => import('../views/Scanner.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/explore',
        name: 'Explore',
        component: () => import('../views/Explore.vue'),
        meta: { requiresAuth: true },
    },
    {
        path: '/stats',
        name: 'Stats',
        component: () => import('../views/Stats.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/product/:barcode',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue'),
        props: true,
        meta: { requiresAuth: true }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
        meta: { requiresGuest: true }
    },
    {
        path: '/offline',
        name: 'Offline',
        component: () => import('../views/OfflinePage.vue'),
        meta: { skipOnlineCheck: true, skipAuth: true }
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: { skipOnlineCheck: true, skipAuth: true }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Backend is on /health (no /api prefix — see app.ts)
// VITE_API_BASE_URL = http://localhost:3000/api  →  base host = http://localhost:3000
export async function isOnline(): Promise<boolean> {
    if (!navigator.onLine) return false
    try {
        const apiBase  = (import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '')
        const host     = apiBase.replace(/\/api$/, '')   // strip trailing /api
        const res      = await fetch(`${host}/health`, {
            method: 'GET',
            cache:  'no-store',
            signal: AbortSignal.timeout(3000),
        })
        return res.ok
    } catch {
        return false
    }
}

router.beforeEach(async (to, _from, next) => {
    if (to.meta.skipOnlineCheck) return next()

    const online = await isOnline()
    if (!online) {
        return next({ path: '/offline', query: { redirect: to.fullPath } })
    }

    if (!to.meta.skipAuth) {
        const authStore = useAuthStore()
        if (!authStore.isInitialized) await authStore.initAuth()

        const requiresAuth  = to.matched.some(r => r.meta.requiresAuth)
        const requiresGuest = to.matched.some(r => r.meta.requiresGuest)

        if (requiresAuth && !authStore.isAuthenticated) return next('/login')
        if (requiresGuest && authStore.isAuthenticated)  return next('/')
    }

    next()
})

export default router