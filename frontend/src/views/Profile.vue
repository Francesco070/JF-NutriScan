<template>
  <div class="profile-wrapper">
    <v-container class="profile-container pa-4">
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex justify-space-between align-center">
          <h1 class="text-h4 font-weight-bold">Profile</h1>
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
              <span class="text-h3 font-weight-bold">{{ userInitials }}</span>
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

        <!-- Preferences -->
        <v-card class="mb-4" color="surface" rounded="lg">
          <v-list bg-color="transparent">
            <v-list-subheader class="text-subtitle-2 font-weight-bold">PREFERENCES</v-list-subheader>
            <v-list-item>
              <template v-slot:prepend>
                <v-icon>{{ isDark ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
              </template>
              <v-list-item-title>Dark Mode</v-list-item-title>
              <template v-slot:append>
                <v-switch
                    :model-value="isDark"
                    @update:model-value="toggleTheme"
                    color="primary"
                    hide-details
                    inset
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card>

        <!-- Account -->
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

        <!-- Support -->
        <v-card class="mb-4" color="surface" rounded="lg">
          <v-list bg-color="transparent">
            <v-list-subheader class="text-subtitle-2 font-weight-bold">SUPPORT</v-list-subheader>
            <v-list-item>
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
        <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">Profil bearbeiten</v-card-title>
        <v-card-text class="pa-6">
          <v-form ref="editForm" validate-on="submit">

            <v-text-field
                v-model="editData.firstname"
                label="Vorname"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :rules="firstNameRules"
                :error-messages="fieldErrors.firstname"
                @input="fieldErrors.firstname = ''"
                class="mb-3"
            />

            <v-text-field
                v-model="editData.lastname"
                label="Nachname"
                variant="outlined"
                prepend-inner-icon="mdi-account"
                :rules="lastNameRules"
                :error-messages="fieldErrors.lastname"
                @input="fieldErrors.lastname = ''"
                class="mb-3"
            />

            <v-text-field
                v-model="editData.email"
                label="Email"
                type="email"
                variant="outlined"
                prepend-inner-icon="mdi-email"
                :rules="emailRules"
                :error-messages="fieldErrors.email"
                @input="fieldErrors.email = ''"
                class="mb-3"
            />

            <v-text-field
                v-model="editData.password"
                label="Neues Passwort (optional)"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                prepend-inner-icon="mdi-lock"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showPassword = !showPassword"
                :rules="passwordRules"
                :error-messages="fieldErrors.password"
                @input="fieldErrors.password = ''"
                hint="Leer lassen um aktuelles Passwort zu behalten"
                persistent-hint
            />

          </v-form>
        </v-card-text>
        <v-card-actions class="pa-6 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Abbrechen</v-btn>
          <v-btn color="primary" variant="flat" :loading="saving" @click="saveProfile">Speichern</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="successSnackbar" :timeout="3000" color="success" location="top">
      Profil erfolgreich aktualisiert!
    </v-snackbar>
    <v-snackbar v-model="errorSnackbar" :timeout="3000" color="error" location="top">
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

const THEME_KEY = 'nutriscan-theme'

const router    = useRouter()
const theme     = useTheme()
const authStore = useAuthStore()

const savedTheme = localStorage.getItem(THEME_KEY) ?? 'dark'
theme.change(savedTheme)
const isDark = ref(savedTheme === 'dark')

function toggleTheme() {
  const next = isDark.value ? 'light' : 'dark'
  theme.change(next)
  isDark.value = !isDark.value
  localStorage.setItem(THEME_KEY, next)
}

const isLoading       = ref(true)
const editDialog      = ref(false)
const saving          = ref(false)
const showPassword    = ref(false)
const successSnackbar = ref(false)
const errorSnackbar   = ref(false)
const errorMessage    = ref('')
const editForm        = ref()

const editData = ref({ firstname: '', lastname: '', email: '', password: '' })

const fieldErrors = ref({ firstname: '', lastname: '', email: '', password: '' })

const stats = ref({
  totalScans: 0,
  totalFavorites: 0,
  healthScoreTrend: [] as Array<{ date: string; score: number | null }>,
  nutriScoreDistribution: [] as Array<{ grade: string; count: number; percent: number }>,
})

const firstNameRules = [
  (v: string) => !!v || 'Vorname ist erforderlich',
  (v: string) => v.length >= 2 || 'Vorname muss mindestens 2 Zeichen lang sein',
  (v: string) => /^[a-zA-ZäöüÄÖÜß\s-]+$/.test(v) || 'Vorname darf nur Buchstaben enthalten',
]

const lastNameRules = [
  (v: string) => !!v || 'Nachname ist erforderlich',
  (v: string) => v.length >= 2 || 'Nachname muss mindestens 2 Zeichen lang sein',
  (v: string) => /^[a-zA-ZäöüÄÖÜß\s-]+$/.test(v) || 'Nachname darf nur Buchstaben enthalten',
]

const emailRules = [
  (v: string) => !!v || 'Email ist erforderlich',
  (v: string) => /.+@.+\..+/.test(v) || 'Email muss gültig sein',
]

// Password is optional in edit — only validate if something was entered
const passwordRules = [
  (v: string) => !v || v.length >= 6 || 'Passwort muss mindestens 6 Zeichen lang sein',
]

// ── Computed ──────────────────────────────────────────────────────────────────
const userInitials = computed(() => {
  if (!authStore.user) return '?'
  const first = authStore.user.firstname?.[0] || ''
  const last  = authStore.user.lastname?.[0]  || ''
  return (first + last).toUpperCase() || authStore.user.email?.[0].toUpperCase() || '?'
})

const fullName  = computed(() => `${authStore.user?.firstname || ''} ${authStore.user?.lastname || ''}`.trim() || 'User')
const userEmail = computed(() => authStore.user?.email || 'user@example.com')

function calculateStreak(): number {
  const trend = stats.value.healthScoreTrend
  let streak  = 0
  for (let i = trend.length - 1; i >= 0; i--) {
    if (trend[i].score !== null) streak++
    else break
  }
  return streak
}

watch(editDialog, (open) => {
  if (open && authStore.user) {
    editData.value = {
      firstname: authStore.user.firstname,
      lastname:  authStore.user.lastname,
      email:     authStore.user.email,
      password:  '',
    }
    fieldErrors.value = { firstname: '', lastname: '', email: '', password: '' }
    showPassword.value = false
  }
})

function closeDialog() {
  editDialog.value = false
  editForm.value?.reset()
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

async function saveProfile() {
  const { valid } = await editForm.value.validate()
  if (!valid) return

  saving.value = true
  try {
    const payload: any = {
      firstname: editData.value.firstname,
      lastname:  editData.value.lastname,
      email:     editData.value.email,
    }
    if (editData.value.password) payload.password = editData.value.password

    const success = await authStore.updateProfile(payload)
    if (success) {
      editDialog.value      = false
      successSnackbar.value = true
    } else {
      errorMessage.value  = authStore.error || 'Update fehlgeschlagen'
      errorSnackbar.value = true
    }
  } catch (err: any) {
    errorMessage.value  = err.message || 'Update fehlgeschlagen'
    errorSnackbar.value = true
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  try {
    const data = await authAPI.getStats()
    if (data) stats.value = data
  } catch (e) {
    console.error('Fehler beim Laden der Stats:', e)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.profile-wrapper {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}
</style>