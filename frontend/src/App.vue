<template>
  <v-app>
    <v-main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- Global Bottom Navigation (außer auf Scanner und Login) -->
      <BottomNav v-if="showBottomNav" />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'

const route = useRoute()

// Hide bottom nav on login and full-screen scanner
const showBottomNav = computed(() => {
  const hiddenRoutes = ['/login', '/register']
  return !hiddenRoutes.includes(route.path)
})
</script>

<style>
/* Main content area */
.main-content {
  height: 100vh;
  overflow: hidden; /* Prevent unwanted scrolling */
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Global: All views should account for bottom nav */
.v-main > .v-main__wrap {
  overflow: hidden;
}
</style>