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
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// Navigation Guards
router.beforeEach(async (to, _from, next) => {
    const authStore = useAuthStore()

    if (!authStore.isInitialized) {
        await authStore.initAuth()
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest)

    if (requiresAuth && !authStore.isAuthenticated) {
        // Benutzer muss eingeloggt sein, ist aber nicht eingeloggt
        next('/login')
    } else if (requiresGuest && authStore.isAuthenticated) {
        // Benutzer ist bereits eingeloggt und versucht Login/Register zu öffnen
        next('/')
    } else {
        next()
    }
})

export default router