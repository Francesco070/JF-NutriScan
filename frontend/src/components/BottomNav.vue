<template>
  <v-bottom-navigation
      v-model="currentRoute"
      grow
      color="primary"
      class="bottom-nav-fixed"
      bg-color="surface"
      elevation="8"
  >
    <v-btn value="/" @click="navigate('/')">
      <v-icon>mdi-home</v-icon>
      <span>Feed</span>
    </v-btn>

    <v-btn value="/explore" @click="navigate('/explore')">
      <v-icon>mdi-magnify</v-icon>
      <span>Explore</span>
    </v-btn>

    <v-btn value="/scanner" @click="navigate('/scanner')" class="scan-btn-nav">

      <transition name="scan-morph" mode="out-in">
        <!-- Floating FAB -->
        <v-avatar
            v-if="!isOnScanner"
            key="fab"
            color="primary"
            size="56"
            class="scan-avatar-nav"
            elevation="8"
        >
          <v-icon size="32">mdi-camera</v-icon>
        </v-avatar>

        <!-- Normal Nav Icon -->
        <div v-else key="nav" class="scan-icon-wrapper">
          <v-icon>mdi-camera</v-icon>
          <span>Scan</span>
        </div>
      </transition>

      <!-- Label only for FAB state -->
      <span v-if="!isOnScanner" class="scan-label">Scan</span>
    </v-btn>

    <v-btn value="/stats" @click="navigate('/stats')">
      <v-icon>mdi-chart-bar</v-icon>
      <span>Stats</span>
    </v-btn>

    <v-btn value="/profile" @click="navigate('/profile')">
      <v-icon>mdi-account</v-icon>
      <span>Profile</span>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const currentRoute = ref(route.path)

// Check if currently on scanner page
const isOnScanner = computed(() => route.path === '/scanner')

// Watch route changes to update active tab
watch(() => route.path, (newPath) => {
  currentRoute.value = newPath
})

const navigate = (path: string) => {
  if (route.path !== path) {
    router.push(path)
  }
}
</script>

<style scoped>
.bottom-nav-fixed {
  position: fixed !important;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
  overflow: visible !important; /* CRITICAL: Allow camera icon to overflow */
}

/* Force overflow visible on Vuetify's internal container */
.bottom-nav-fixed :deep(.v-bottom-navigation__content) {
  overflow: visible !important;
}

.scan-btn-nav {
  position: relative;
  overflow: visible !important;
}

/* Large floating avatar (when NOT on scanner page) */
.scan-avatar-nav {
  position: absolute;
  top: -28px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.4) !important;
}

/* Label spacing for floating button */
.scan-label {
  margin-top: 24px;
}

/* MORPH TRANSITION */
.scan-morph-enter-active,
.scan-morph-leave-active {
  transition: all 280ms cubic-bezier(.4, 0, .2, 1);
  position: absolute;
  left: 50%;
  transform-origin: center;
}

/* ENTER (normal icon appears) */
.scan-morph-enter-from {
  opacity: 0;
  transform: translate(-50%, -28px) scale(1.6);
}

.scan-morph-enter-to {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
}

/* LEAVE (fab shrinks down) */
.scan-morph-leave-from {
  opacity: 1;
  transform: translate(-50%, -28px) scale(1);
}

.scan-morph-leave-to {
  opacity: 0;
  transform: translate(-50%, 0) scale(0.6);
}

/* Wrapper so icon + text stay centered */
.scan-icon-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Ensure smooth layering */
.scan-btn-nav {
  position: relative;
  height: 64px;
}
</style>