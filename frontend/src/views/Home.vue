<template>
  <div class="home-wrapper">
    <v-container class="home-container pa-4">
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12" class="d-flex align-center justify-space-between">
          <div>
            <div class="d-flex align-center mb-1">
              <v-icon color="primary" size="32" class="mr-2">mdi-nutrition</v-icon>
              <h2 class="text-h5 font-weight-bold">NutriScan</h2>
            </div>
            <h1 class="text-h4 font-weight-bold mb-1">halooooo, Sarah 👋 {{ apiBaseUrl }}</h1>
            <p class="text-body-2 text-medium-emphasis">Keep up the great habits!</p>
          </div>
          <v-btn icon variant="text">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Stats Cards -->
      <v-row class="mb-4">
        <v-col cols="6">
          <v-card class="stat-card" color="surface" rounded="lg">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" size="20" class="mr-2">mdi-barcode-scan</v-icon>
                <span class="text-caption text-medium-emphasis">Scanned Today</span>
              </div>
              <h2 class="text-h4 font-weight-bold">3 items</h2>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card class="stat-card" color="surface" rounded="lg">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="success" size="20" class="mr-2">mdi-heart-outline</v-icon>
                <span class="text-caption text-medium-emphasis">Health Score</span>
              </div>
              <h2 class="text-h4 font-weight-bold">85<span class="text-caption">/100</span></h2>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Weekly Progress -->
      <v-card class="mb-4" color="surface" rounded="lg">
        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-subtitle-1 font-weight-bold">Weekly Goal Progress</h3>
            <v-chip color="success" size="small" variant="flat">Excellent</v-chip>
          </div>
          <v-progress-linear
              :model-value="75"
              color="success"
              height="8"
              rounded
              class="mb-2"
          ></v-progress-linear>
          <p class="text-caption text-medium-emphasis">
            You are consuming 15% less processed sugar than last week.
          </p>
        </v-card-text>
      </v-card>

      <!-- Recent Scans -->
      <div class="d-flex justify-space-between align-center mb-3">
        <h3 class="text-h6 font-weight-bold">Recent Scans</h3>
        <v-btn variant="text" color="primary" size="small">See All</v-btn>
      </div>

      <v-row class="mb-4">
        <v-col cols="6">
          <v-card class="product-card" color="surface" rounded="lg" @click="viewProduct('123')">
            <v-img
                src="https://images.openfoodfacts.org/images/products/500/013/400/3850/front_en.3.400.jpg"
                height="140"
                cover
                class="product-image"
            ></v-img>
            <v-card-text class="pa-3">
              <v-chip color="success" size="x-small" class="mb-2">A</v-chip>
              <h4 class="text-subtitle-2 font-weight-bold mb-1">Greek Yogurt</h4>
              <p class="text-caption text-medium-emphasis">Chobani - 150 kcal</p>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card class="product-card" color="surface" rounded="lg" @click="viewProduct('456')">
            <v-img
                src="https://images.openfoodfacts.org/images/products/376/168/005/5143/front_en.4.400.jpg"
                height="140"
                cover
                class="product-image"
            ></v-img>
            <v-card-text class="pa-3">
              <v-chip color="warning" size="x-small" class="mb-2">C</v-chip>
              <h4 class="text-subtitle-2 font-weight-bold mb-1">Almond Milk</h4>
              <p class="text-caption text-medium-emphasis">Silk - 30 kcal</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Daily Insight -->
      <v-card color="surface" rounded="lg">
        <v-card-text>
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Daily Insight</h3>
          <div class="d-flex">
            <v-avatar color="success" size="40" class="mr-3">
              <v-icon>mdi-lightbulb-outline</v-icon>
            </v-avatar>
            <div>
              <h4 class="text-subtitle-2 font-weight-bold mb-1">Better Alternatives Found</h4>
              <p class="text-caption text-medium-emphasis">
                We found a brand of Almond Milk with 50% less sugar than your usual choice. Check it out!
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL  // ✅ hier erlaubt
import { useRouter } from 'vue-router'

const router = useRouter()

const viewProduct = (barcode: string) => {
  router.push(`/product/${barcode}`)
}
</script>

<style scoped>
/* Wrapper with proper height and scrolling */
.home-wrapper {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px; /* Space for bottom nav */
}

.home-container {
  max-width: 600px;
  margin: 0 auto;
}

.stat-card {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.product-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image {
  border-radius: 12px 12px 0 0;
}
</style>