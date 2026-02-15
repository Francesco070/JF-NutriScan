<template>
  <div class="profile-wrapper">
    <v-container class="profile-container pa-4">
      <!-- Header with Settings -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4 font-weight-bold">Profile</h1>
          <v-btn icon variant="text" @click="toggleTheme">
            <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-2 text-medium-emphasis mt-4">Lade Profil...</p>
      </div>

      <template v-else>
        <!-- Profile Header -->
        <v-card class="mb-4" color="surface" rounded="lg">
          <v-card-text class="text-center pa-6">
            <v-avatar size="100" color="primary" class="mb-4">
              <span class="text-h3 font-weight-bold">
                {{ userInitials }}
              </span>
            </v-avatar>
            <h2 class="text-h5 font-weight-bold mb-1">{{ fullName }}</h2>
            <p class="text-body-2 text-medium-emphasis mb-4">{{ userEmail }}</p>
            <v-btn color="primary" variant="tonal" rounded="lg" disabled>
              Edit Profile
            </v-btn>
          </v-card-text>
        </v-card>

        <!-- Stats Overview -->
        <v-row class="mb-4">
          <v-col cols="4">
            <v-card color="surface" rounded="lg">
              <v-card-text class="text-center">
                <h3 class="text-h4 font-weight-bold primary--text">{{ stats.totalScans }}</h3>
                <p class="text-caption text-medium-emphasis">Scans</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card color="surface" rounded="lg">
              <v-card-text class="text-center">
                <h3 class="text-h4 font-weight-bold success--text">{{ stats.totalFavorites }}</h3>
                <p class="text-caption text-medium-emphasis">Favorites</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="4">
            <v-card color="surface" rounded="lg">
              <v-card-text class="text-center">
                <h3 class="text-h4 font-weight-bold warning--text">{{ calculateStreak() }}</h3>
                <p class="text-caption text-medium-emphasis">Streak</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Settings Sections -->
        <v-card class="mb-4" color="surface" rounded="lg">
          <v-list bg-color="transparent">
            <v-list-subheader class="text-subtitle-2 font-weight-bold">PREFERENCES</v-list-subheader>

            <v-list-item @click="() => {}">
              <template v-slot:prepend>
                <v-icon>mdi-bell-outline</v-icon>
              </template>
              <v-list-item-title>Notifications</v-list-item-title>
              <template v-slot:append>
                <v-switch v-model="notificationsEnabled" color="primary" hide-details inset></v-switch>
              </template>
            </v-list-item>

            <v-list-item @click="() => {}">
              <template v-slot:prepend>
                <v-icon>{{ isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
              </template>
              <v-list-item-title>Dark Mode</v-list-item-title>
              <template v-slot:append>
                <v-switch v-model="isDark" @change="toggleTheme" color="primary" hide-details inset></v-switch>
              </template>
            </v-list-item>

            <v-list-item @click="() => {}">
              <template v-slot:prepend>
                <v-icon>mdi-web</v-icon>
              </template>
              <v-list-item-title>Offline Mode</v-list-item-title>
              <template v-slot:append>
                <v-switch v-model="offlineModeEnabled" color="primary" hide-details inset></v-switch>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="mb-4" color="surface" rounded="lg">
          <v-list bg-color="transparent">
            <v-list-subheader class="text-subtitle-2 font-weight-bold">ACCOUNT</v-list-subheader>

            <v-list-item @click="() => {}">
              <template v-slot:prepend>
                <v-icon>mdi-lock-outline</v-icon>
              </template>
              <v-list-item-title>Privacy & Security</v-list-item-title>
              <template v-slot:append>
                <v-icon>mdi-chevron-right</v-icon>
              </template>
            </v-list-item>

            <v-list-item @click="router.push('/explore')">
              <template v-slot:prepend>
                <v-icon>mdi-history</v-icon>
              </template>
              <v-list-item-title>Scan History</v-list-item-title>
              <template v-slot:append>
                <v-icon>mdi-chevron-right</v-icon>
              </template>
            </v-list-item>

            <v-list-item @click="() => {}">
              <template v-slot:prepend>
                <v-icon>mdi-download-outline</v-icon>
              </template>
              <v-list-item-title>Export Data</v-list-item-title>
              <template v-slot:append>
                <v-icon>mdi-chevron-right</v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <v-card class="mb-4" color="surface" rounded="lg">
          <v-list bg-color="transparent">
            <v-list-subheader class="text-subtitle-2 font-weight-bold">SUPPORT</v-list-subheader>

            <v-list-item @click="() => {}">
              <template v-slot:prepend>
                <v-icon>mdi-help-circle-outline</v-icon>
              </template>
              <v-list-item-title>Help & Support</v-list-item-title>
              <template v-slot:append>
                <v-icon>mdi-chevron-right</v-icon>
              </template>
            </v-list-item>

            <v-list-item @click="() => {}">
              <template v-slot:prepend>
                <v-icon>mdi-information-outline</v-icon>
              </template>
              <v-list-item-title>About</v-list-item-title>
              <template v-slot:append>
                <span class="text-caption text-medium-emphasis">v1.0.0</span>
              </template>
            </v-list-item>

            <v-list-item @click="handleLogout" class="text-error">
              <template v-slot:prepend>
                <v-icon color="error">mdi-logout</v-icon>
              </template>
              <v-list-item-title>Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'

const router = useRouter()
const theme = useTheme()
const authStore = useAuthStore()

const isDark = ref(theme.global.name.value === 'dark')
const isLoading = ref(true)
const notificationsEnabled = ref(true)
const offlineModeEnabled = ref(false)

const stats = ref({
  totalScans: 0,
  totalFavorites: 0,
  healthScoreTrend: [] as Array<{ date: string; score: number | null }>,
  nutriScoreDistribution: [] as Array<{ grade: string; count: number; percent: number }>
})

const userInitials = computed(() => {
  if (!authStore.user) return '?'
  const first = authStore.user.firstname?.[0] || ''
  const last = authStore.user.lastname?.[0] || ''
  return (first + last).toUpperCase() || authStore.user.email?.[0].toUpperCase() || '?'
})

const fullName = computed(() => {
  if (!authStore.user) return 'User'
  return `${authStore.user.firstname || ''} ${authStore.user.lastname || ''}`.trim() || 'User'
})

const userEmail = computed(() => authStore.user?.email || 'user@example.com')

const calculateStreak = () => {
  const trend = stats.value.healthScoreTrend
  if (trend.length === 0) return 0

  // Count consecutive days with scans (non-null scores)
  let streak = 0
  for (let i = trend.length - 1; i >= 0; i--) {
    if (trend[i].score !== null) {
      streak++
    } else {
      break
    }
  }
  return streak
}

const toggleTheme = () => {
  isDark.value = !isDark.value
  // Verwende die korrekte Vuetify 3 API für Theme-Switching
  theme.global.current.value.dark = isDark.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  try {
    const statsData = await authAPI.getStats()
    if (statsData) {
      stats.value = statsData
    }
  } catch (error) {
    console.error('Fehler beim Laden der Stats:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Wrapper with proper height and scrolling */
.profile-wrapper {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px; /* Space for bottom nav */
}

.profile-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>