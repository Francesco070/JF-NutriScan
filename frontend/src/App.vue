<template>
  <v-app>
    <v-main class="main-content">
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

onMounted(async () => {
  await authStore.initAuth()

  // Log API config in development
  if (import.meta.env.DEV) {
    console.log('🚀 NutriScan Frontend gestartet')
    console.log('📡 API Base URL:', API_CONFIG.baseUrl)
  }
})
</script>