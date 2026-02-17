<template>
  <div class="offline-page">
    <div class="offline-content">
      <!-- Icon with animated rings -->
      <div class="icon-wrapper mb-6">
        <div class="ring ring-1" />
        <div class="ring ring-2" />
        <div class="ring ring-3" />
        <v-icon size="56" color="primary" class="wifi-icon">mdi-wifi-off</v-icon>
      </div>

      <h1 class="text-h5 font-weight-bold mb-2">No Connection</h1>
      <p class="text-body-2 text-medium-emphasis mb-8">
        NutriScan requires an internet connection to scan and look up products.
        Check your Wi-Fi or mobile data and try again.
      </p>

      <!-- Retry button -->
      <v-btn
          color="primary"
          size="large"
          rounded="xl"
          :loading="checking"
          elevation="0"
          @click="checkNow"
      >
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>

      <!-- Auto-check indicator -->
      <div class="mt-6 d-flex align-center gap-2" style="gap:8px">
        <v-progress-circular
            :size="14"
            :width="2"
            color="grey"
            indeterminate
        />
        <span class="text-caption text-medium-emphasis">
          Checking every {{ POLL_INTERVAL / 1000 }}s…
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const checking = ref(false)

const POLL_INTERVAL = 5000   // ms between automatic checks
const CHECK_URL    = '/favicon.ico' // tiny cacheable asset to ping

let pollTimer: ReturnType<typeof setInterval> | null = null

/**
 * Returns true when we have a real network connection.
 * navigator.onLine can lie (e.g. connected to a router without internet),
 * so we do a real fetch against a tiny asset as a secondary check.
 */
async function isOnline(): Promise<boolean> {
  if (!navigator.onLine) return false
  try {
    // no-store prevents cache from masking a real outage
    const res = await fetch(CHECK_URL, {
      method: 'HEAD',
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    })
    return res.ok
  } catch {
    return false
  }
}

async function checkNow() {
  checking.value = true
  const online = await isOnline()
  checking.value = false
  if (online) {
    redirectBack()
  }
}

function redirectBack() {
  // Go to the page the user originally wanted, or fall back to home
  const intended = (router.currentRoute.value.query.redirect as string) || '/'
  router.replace(intended)
}

async function pollOnlineStatus() {
  const online = await isOnline()
  if (online) {
    stopPolling()
    redirectBack()
  }
}

function startPolling() {
  pollTimer = setInterval(pollOnlineStatus, POLL_INTERVAL)
}

function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// Also react immediately to browser online/offline events
function handleOnlineEvent() { pollOnlineStatus() }

onMounted(() => {
  startPolling()
  window.addEventListener('online', handleOnlineEvent)
})

onUnmounted(() => {
  stopPolling()
  window.removeEventListener('online', handleOnlineEvent)
})
</script>

<style scoped>
.offline-page {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: rgb(var(--v-theme-background));
  text-align: center;
  padding: 24px;
}

.offline-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 360px;
  width: 100%;
}

/* Pulsing rings around the icon */
.icon-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid rgb(var(--v-theme-primary));
  animation: ripple 2.4s ease-out infinite;
  opacity: 0;
}
.ring-1 { width: 68px;  height: 68px;  animation-delay: 0s; }
.ring-2 { width: 84px;  height: 84px;  animation-delay: 0.6s; }
.ring-3 { width: 100px; height: 100px; animation-delay: 1.2s; }

@keyframes ripple {
  0%   { transform: scale(0.8); opacity: 0.5; }
  100% { transform: scale(1.3); opacity: 0; }
}

.wifi-icon {
  position: relative;
  z-index: 1;
  opacity: 0.6;
}
</style>