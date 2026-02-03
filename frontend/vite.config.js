import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify from 'vite-plugin-vuetify';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
    plugins: [
        vue(),
        vuetify({ autoImport: true }),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'NutriScan Food Scanner',
                short_name: 'NutriScan',
                description: 'Scan and track food products',
                theme_color: '#4CAF50',
                background_color: '#ffffff',
                display: 'standalone',
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});
