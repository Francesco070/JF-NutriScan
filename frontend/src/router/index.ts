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
        children: [
            {
                path: 'product/:barcode',
                name: 'ExploreProduct',
                component: () => import('../views/ProductDetail.vue'),
                props: true,
            }
        ]
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
    // ── Offline page ─────────────────────────────────────────────────────────
    {
        path: '/offline',
        name: 'Offline',
        component: () => import('../views/OfflinePage.vue'),
        meta: { skipOnlineCheck: true, skipAuth: true }
    },
    // ── 404 catch-all ────────────────────────────────────────────────────────
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('../views/NotFound.vue'),
        meta: { skipAuth: true }
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

async function isOnline(): Promise<boolean> {
    if (!navigator.onLine) return false
    try {
        const res = await fetch(import.meta.env.VITE_API_BASE_URL + "/products/40144467", {
            method: 'HEAD',
            cache: 'no-store',
            signal: AbortSignal.timeout(3000),
        })

        return res.ok
    } catch {
        return false
    }
}

router.beforeEach(async (to, _from, next) => {
    if (!to.meta.skipOnlineCheck) {
        const online = await isOnline()
        if (!online) {
            // Pass the intended destination so OfflinePage can redirect back
            return next({ path: '/offline', query: { redirect: to.fullPath } })
        }
    }

    // 2. Auth check
    if (!to.meta.skipAuth) {
        const authStore = useAuthStore()

        if (!authStore.isInitialized) {
            await authStore.initAuth()
        }

        const requiresAuth  = to.matched.some(record => record.meta.requiresAuth)
        const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

        if (requiresAuth && !authStore.isAuthenticated) {
            return next('/login')
        }
        if (requiresGuest && authStore.isAuthenticated) {
            return next('/')
        }
    }

    next()
})

export default router