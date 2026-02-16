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
            <v-btn color="primary" variant="tonal" rounded="lg" @click="editDialog = true">
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

            <v-list-item>
              <template v-slot:prepend>
                <v-icon>{{ isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
              </template>
              <v-list-item-title>Dark Mode</v-list-item-title>
              <template v-slot:append>
                <v-switch v-model="isDark" @change="toggleTheme" color="primary" hide-details inset></v-switch>
              </template>
            </v-list-item>

          </v-list>
        </v-card>

        <v-card class="mb-4" color="surface" rounded="lg">
          <v-list bg-color="transparent">
            <v-list-subheader class="text-subtitle-2 font-weight-bold">ACCOUNT</v-list-subheader>

            <v-list-item @click="router.push('/explore')">
              <template v-slot:prepend>
                <v-icon>mdi-history</v-icon>
              </template>
              <v-list-item-title>Scan History</v-list-item-title>
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

    <!-- Edit Profile Dialog -->
    <v-dialog v-model="editDialog" max-width="500px">
      <v-card rounded="xl">
        <v-card-title class="text-h5 font-weight-bold">Profil bearbeiten</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
                v-model="editData.firstname"
                label="Vorname"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                class="mb-3"
            />
            <v-text-field
                v-model="editData.lastname"
                label="Nachname"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                class="mb-3"
            />
            <v-text-field
                v-model="editData.email"
                label="Email"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                class="mb-3"
            />
            <v-text-field
                v-model="editData.password"
                label="Neues Passwort (optional)"
                type="password"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                hint="Leer lassen um aktuelles Passwort zu behalten"
                persistent-hint
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="editDialog = false">Abbrechen</v-btn>
          <v-btn
              color="primary"
              variant="flat"
              @click="saveProfile"
              :loading="saving"
          >
            Speichern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
        v-model="successSnackbar"
        :timeout="3000"
        color="success"
        location="top"
    >
      Profil erfolgreich aktualisiert!
    </v-snackbar>

    <!-- Error Snackbar -->
    <v-snackbar
        v-model="errorSnackbar"
        :timeout="3000"
        color="error"
        location="top"
    >
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
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
const editDialog = ref(false)
const saving = ref(false)
const successSnackbar = ref(false)
const errorSnackbar = ref(false)
const errorMessage = ref('')

const editData = ref({
  firstname: '',
  lastname: '',
  email: '',
  password: ''
})

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
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  isDark.value = !isDark.value
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Watch edit dialog to populate form
watch(editDialog, (newVal) => {
  if (newVal && authStore.user) {
    editData.value = {
      firstname: authStore.user.firstname,
      lastname: authStore.user.lastname,
      email: authStore.user.email,
      password: ''
    }
  }
})

const saveProfile = async () => {
  saving.value = true

  try {
    const updateData: any = {
      firstname: editData.value.firstname,
      lastname: editData.value.lastname,
      email: editData.value.email,
    }

    // Only include password if provided
    if (editData.value.password) {
      updateData.password = editData.value.password
    }

    const success = await authStore.updateProfile(updateData)

    if (success) {
      editDialog.value = false
      successSnackbar.value = true
    } else {
      errorMessage.value = authStore.error || 'Update fehlgeschlagen'
      errorSnackbar.value = true
    }
  } catch (err: any) {
    console.error('Failed to update profile:', err)
    errorMessage.value = err.message || 'Update fehlgeschlagen'
    errorSnackbar.value = true
  } finally {
    saving.value = false
  }
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