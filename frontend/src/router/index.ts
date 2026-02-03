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
        path: '/product/:barcode',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue'),
        props: true,
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('../views/Profile.vue'),
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('../views/Login.vue'),
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router