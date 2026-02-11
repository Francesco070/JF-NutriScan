<template>
  <v-container class="register-view">
    <v-row justify="center" align="center" class="auth-container">
      <v-col cols="12" sm="10" md="6" lg="5">
        <div class="text-center mb-8">
          <!-- Logo Image -->
          <v-img
              src="/no-background-icon.png"
              width="150"
              class="mx-auto"
          />
          <h1 class="text-h3 mt-4 mb-2">NutriScan</h1>
          <p class="text-body-1 text-grey">Erstelle dein Konto</p>
        </div>

        <v-card color="background" elevation="0">
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleRegister">
              <!-- First Name Field -->
              <v-text-field
                  v-model="firstname"
                  label="Vorname"
                  type="text"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  :rules="firstNameRules"
                  :error-messages="firstNameError"
                  required
                  class="mb-4"
                  @input="firstNameError = ''"
              />

              <!-- Last Name Field -->
              <v-text-field
                  v-model="lastname"
                  label="Nachname"
                  type="text"
                  prepend-inner-icon="mdi-account-outline"
                  variant="outlined"
                  :rules="lastNameRules"
                  :error-messages="lastNameError"
                  required
                  class="mb-4"
                  @input="lastNameError = ''"
              />

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
              >
                <template v-slot:details>
                  <div class="text-caption text-grey mt-1">
                    Mindestens 6 Zeichen
                  </div>
                </template>
              </v-text-field>

              <!-- Confirm Password Field -->
              <v-text-field
                  v-model="confirmPassword"
                  label="Passwort bestätigen"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  prepend-inner-icon="mdi-lock-check-outline"
                  :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  :rules="confirmPasswordRules"
                  :error-messages="confirmPasswordError"
                  required
                  class="mb-4"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword"
                  @input="confirmPasswordError = ''"
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

              <!-- Register Button -->
              <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  block
                  :loading="authStore.isLoading"
                  class="mb-4"
              >
                Registrieren
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-6" />

              <!-- Login Link -->
              <div class="text-center">
                <p class="text-body-2 text-grey mb-2">
                  Bereits ein Konto?
                </p>
                <v-btn
                    variant="outlined"
                    color="primary"
                    size="large"
                    block
                    @click="router.push('/login')"
                >
                  Jetzt anmelden
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

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const firstNameError = ref('')
const lastNameError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

// Validation Rules
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

const passwordRules = [
  (v: string) => !!v || 'Passwort ist erforderlich',
  (v: string) => v.length >= 6 || 'Passwort muss mindestens 6 Zeichen lang sein',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Passwortbestätigung ist erforderlich',
  (v: string) => v === password.value || 'Passwörter stimmen nicht überein',
]

const handleRegister = async () => {
  // Reset errors
  firstNameError.value = ''
  lastNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  // Validate First Name
  if (!firstname.value) {
    firstNameError.value = 'Vorname ist erforderlich'
    return
  }
  if (firstname.value.length < 2) {
    firstNameError.value = 'Vorname muss mindestens 2 Zeichen lang sein'
    return
  }
  if (!/^[a-zA-ZäöüÄÖÜß\s-]+$/.test(firstname.value)) {
    firstNameError.value = 'Vorname darf nur Buchstaben enthalten'
    return
  }

  // Validate Last Name
  if (!lastname.value) {
    lastNameError.value = 'Nachname ist erforderlich'
    return
  }
  if (lastname.value.length < 2) {
    lastNameError.value = 'Nachname muss mindestens 2 Zeichen lang sein'
    return
  }
  if (!/^[a-zA-ZäöüÄÖÜß\s-]+$/.test(lastname.value)) {
    lastNameError.value = 'Nachname darf nur Buchstaben enthalten'
    return
  }

  // Validate Email
  if (!email.value) {
    emailError.value = 'Email ist erforderlich'
    return
  }
  if (!/.+@.+\..+/.test(email.value)) {
    emailError.value = 'Email muss gültig sein'
    return
  }

  // Validate Password
  if (!password.value) {
    passwordError.value = 'Passwort ist erforderlich'
    return
  }
  if (password.value.length < 6) {
    passwordError.value = 'Passwort muss mindestens 6 Zeichen lang sein'
    return
  }

  // Validate Confirm Password
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Passwortbestätigung ist erforderlich'
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwörter stimmen nicht überein'
    return
  }

  // Register
  const success = await authStore.register(
      firstname.value,
      lastname.value,
      email.value,
      password.value
  )

  if (success) {
    router.push('/')
  }
}
</script>

<style scoped>
.register-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.auth-container {
  min-height: calc(100vh - 150px);
}
</style>