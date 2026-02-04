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

      <!-- Profile Header -->
      <v-card class="mb-4" color="surface" rounded="lg">
        <v-card-text class="text-center pa-6">
          <v-avatar size="100" color="primary" class="mb-4">
            <v-img src="https://i.pravatar.cc/100?img=66"></v-img>
          </v-avatar>
          <h2 class="text-h5 font-weight-bold mb-1">Sarah Johnson</h2>
          <p class="text-body-2 text-medium-emphasis mb-4">sarah.j@example.com</p>
          <v-btn color="primary" variant="tonal" rounded="lg">
            Edit Profile
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Stats Overview -->
      <v-row class="mb-4">
        <v-col cols="4">
          <v-card color="surface" rounded="lg">
            <v-card-text class="text-center">
              <h3 class="text-h4 font-weight-bold primary--text">47</h3>
              <p class="text-caption text-medium-emphasis">Scans</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card color="surface" rounded="lg">
            <v-card-text class="text-center">
              <h3 class="text-h4 font-weight-bold success--text">23</h3>
              <p class="text-caption text-medium-emphasis">Favorites</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="4">
          <v-card color="surface" rounded="lg">
            <v-card-text class="text-center">
              <h3 class="text-h4 font-weight-bold warning--text">12</h3>
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
              <v-switch color="primary" hide-details inset></v-switch>
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
              <v-switch color="primary" hide-details inset></v-switch>
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

          <v-list-item @click="() => {}">
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

          <v-list-item @click="logout" class="text-error">
            <template v-slot:prepend>
              <v-icon color="error">mdi-logout</v-icon>
            </template>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'

const router = useRouter()
const theme = useTheme()
const isDark = ref(theme.global.name.value === 'dark')

const toggleTheme = () => {
  theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
  isDark.value = !isDark.value
}

const logout = () => {
  // Logout logic
  router.push('/login')
}
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