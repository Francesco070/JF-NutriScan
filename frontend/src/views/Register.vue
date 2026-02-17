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
          <p class="text-body-1 text-grey">Create your account</p>
        </div>

        <v-card color="background" elevation="0">
          <v-card-text class="pa-6">
            <v-form @submit.prevent="handleRegister">
              <!-- First Name Field -->
              <v-text-field
                  v-model="firstname"
                  label="First Name"
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
                  label="Last Name"
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
                  label="Password"
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
                    At least 6 characters
                  </div>
                </template>
              </v-text-field>

              <!-- Confirm Password Field -->
              <v-text-field
                  v-model="confirmPassword"
                  label="Confirm Password"
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
                Create Account
              </v-btn>

              <!-- Divider -->
              <v-divider class="my-6" />

              <!-- Login Link -->
              <div class="text-center">
                <p class="text-body-2 text-grey mb-2">
                  Already have an account?
                </p>
                <v-btn
                    variant="outlined"
                    color="primary"
                    size="large"
                    block
                    @click="router.push('/login')"
                >
                  Sign in
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
  (v: string) => !!v || 'First name is required',
  (v: string) => v.length >= 2 || 'First name must be at least 2 characters',
  (v: string) => /^[a-zA-ZäöüÄÖÜß\s-]+$/.test(v) || 'First name may only contain letters',
]

const lastNameRules = [
  (v: string) => !!v || 'Last name is required',
  (v: string) => v.length >= 2 || 'Last name must be at least 2 characters',
  (v: string) => /^[a-zA-ZäöüÄÖÜß\s-]+$/.test(v) || 'Last name may only contain letters',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === password.value || 'Passwords do not match',
]

const handleRegister = async () => {
  firstNameError.value = ''
  lastNameError.value = ''
  emailError.value = ''
  passwordError.value = ''
  confirmPasswordError.value = ''

  if (!firstname.value) {
    firstNameError.value = 'First name is required'
    return
  }
  if (firstname.value.length < 2) {
    firstNameError.value = 'First name must be at least 2 characters'
    return
  }
  if (!/^[a-zA-ZäöüÄÖÜß\s-]+$/.test(firstname.value)) {
    firstNameError.value = 'First name may only contain letters'
    return
  }

  if (!lastname.value) {
    lastNameError.value = 'Last name is required'
    return
  }
  if (lastname.value.length < 2) {
    lastNameError.value = 'Last name must be at least 2 characters'
    return
  }
  if (!/^[a-zA-ZäöüÄÖÜß\s-]+$/.test(lastname.value)) {
    lastNameError.value = 'Last name may only contain letters'
    return
  }

  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }
  if (!/.+@.+\..+/.test(email.value)) {
    emailError.value = 'Email must be valid'
    return
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }
  if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return
  }

  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
    return
  }
  if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  const success = await authStore.register({
    firstname: firstname.value,
    lastname: lastname.value,
    email: email.value,
    password: password.value
  })

  if (success) {
    console.log('✅ Registration successful - redirecting to home')
    await router.push('/')
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