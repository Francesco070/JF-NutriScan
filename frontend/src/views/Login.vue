<template>
  <v-container class="login-view">
    <v-row justify="center" align="center" class="auth-container">
      <v-col cols="12" sm="10" md="6" lg="4">
        <div class="text-center mb-8">
          <!-- Logo Image -->
          <v-img
              src="/no-background-icon.png"
              width="150"
              class="mx-auto"
          />
          <h1 class="text-h3 mt-4 mb-2">NutriScan</h1>
          <p class="text-body-1 text-grey">Willkommen zurück!</p>
        </div>

        <v-card color="background" elevation="0">
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleLogin">
              <!-- Email Field -->
              <v-text-field
                  v-model="email"
                  label="Email"
                  type="email"
                  prepend-inner-icon="mdi-email-outline"
                  variant="outlined"
                  :rules="emailRules"
                  :error-messages="emailError"
                  required
                  class="mb-4"
                  @input="emailError = ''"
              />

              <!-- Password Field -->
              <v-text-field
                  v-model="password"
                  label="Passwort"
                  :type="showPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-outline"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  :rules="passwordRules"
                  :error-messages="passwordError"
                  required
                  class="mb-4"
                  @click:append-inner="showPassword = !showPassword"
                  @input="passwordError = ''"
              />

              <!-- Error Alert -->
              <v-alert
                  v-if="authStore.error"
                  type="error"
                  variant="tonal"
                  density="compact"
                  class="mb-4"
              >
                {{ authStore.error }}
              </v-alert>

              <!-- Login Button -->
              <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="authStore.isLoading"
                  class="mb-4"
              >
                Anmelden
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-6" />

              <!-- Register Link -->
              <div class="text-center">
                <p class="text-body-2 text-grey mb-2">
                  Noch kein Konto?
                </p>
                <v-btn
                    variant="outlined"
                    color="primary"
                    size="large"
                    block
                    @click="router.push('/register')"
                >
                  Jetzt registrieren
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')

// Validation Rules
const emailRules = [
  (v: string) => !!v || 'Email ist erforderlich',
  (v: string) => /.+@.+\..+/.test(v) || 'Email muss gültig sein',
]

const passwordRules = [
  (v: string) => !!v || 'Passwort ist erforderlich',
  (v: string) => v.length >= 6 || 'Passwort muss mindestens 6 Zeichen lang sein',
]

const handleLogin = async () => {
  // Reset errors
  emailError.value = ''
  passwordError.value = ''

  // Validate
  if (!email.value) {
    emailError.value = 'Email ist erforderlich'
    return
  }
  if (!/.+@.+\..+/.test(email.value)) {
    emailError.value = 'Email muss gültig sein'
    return
  }
  if (!password.value) {
    passwordError.value = 'Passwort ist erforderlich'
    return
  }
  if (password.value.length < 6) {
    passwordError.value = 'Passwort muss mindestens 6 Zeichen lang sein'
    return
  }

  // Login
  const success = await authStore.login(email.value, password.value)

  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.login-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.auth-container {
  min-height: calc(100vh - 150px);
}
</style>