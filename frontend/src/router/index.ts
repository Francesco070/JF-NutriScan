import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('../views/Home.vue'),
    },
    {
        path: '/scanner',
        name: 'Scanner',
        component: () => import('../views/Scanner.vue'),
    },
    {
        path: '/explore',
        name: 'Explore',
        component: () => import('../views/Explore.vue'),
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
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
    },
    {
        path: '/product/:barcode',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue'),
        props: true,
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
    },
    {
        path: '/register',
        name: 'Register',
        component: () => import('../views/Register.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router