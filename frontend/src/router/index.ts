import { createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
    },
    {
        path: '/scanner',
        name: 'Scanner',
        component: () => import('@/views/Scanner.vue'),
    },
    {
        path: '/product/:barcode',
        name: 'ProductDetail',
        component: () => import('@/views/ProductDetail.vue'),
        props: true,
    },
    {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
    },
]

// @ts-ignore
const router = createRouter({
    routes,
})

export default router