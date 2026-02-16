<template>
  <v-app>
    <v-main :class="['main-content', { 'no-scroll': isScanner }]">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <BottomNav v-if="showBottomNav" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { API_CONFIG } from '@/config/api'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()
const authStore = useAuthStore()

const showBottomNav = computed(() => {
  const hiddenRoutes = ['/login', '/register']
  return !hiddenRoutes.includes(route.path)
})

const isScanner = computed(() => route.path === '/scanner')

onMounted(async () => {
  await authStore.initAuth()

  if (import.meta.env.DEV) {
    console.log('🚀 NutriScan Frontend gestartet')
    console.log('📡 API Base URL:', API_CONFIG.baseUrl)
  }
})
</script>

<style>
/* Lock browser-level scroll — views manage their own scrolling */
html, body {
  overflow: hidden !important;
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Default: v-main can scroll for content views */
.v-main.main-content {
  overflow-y: auto !important;
  overflow-x: hidden !important;
  height: 100vh;
}

/* Scanner: completely locked — no scroll at all, true fullscreen */
.v-main.main-content.no-scroll {
  overflow: hidden !important;
}
</style>