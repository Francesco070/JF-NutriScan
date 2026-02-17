<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <!-- Animated 404 -->
      <div class="error-code">
        <span class="digit">4</span>
        <div class="barcode-zero">
          <v-icon size="96" color="primary" class="barcode-icon">mdi-barcode-off</v-icon>
        </div>
        <span class="digit">4</span>
      </div>

      <h1 class="text-h5 font-weight-bold mt-4 mb-2">Page Not Found</h1>
      <p class="text-body-2 text-medium-emphasis mb-8">
        The route <code class="route-chip">{{ $route.fullPath }}</code> doesn't exist.
      </p>

      <v-btn
          color="primary"
          size="large"
          rounded="xl"
          @click="$router.push('/')"
          elevation="0"
      >
        <v-icon start>mdi-home</v-icon>
        Back to Home
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
// No logic needed — purely presentational
</script>

<style scoped>
.not-found-page {
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

.not-found-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 360px;
  width: 100%;
}

.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.digit {
  font-size: 96px;
  font-weight: 900;
  line-height: 1;
  color: rgb(var(--v-theme-on-background));
  opacity: 0.15;
  font-variant-numeric: tabular-nums;
}

.barcode-zero {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
}

.barcode-icon {
  animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
}

.route-chip {
  display: inline-block;
  background: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  padding: 2px 8px;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.8rem;
}
</style>