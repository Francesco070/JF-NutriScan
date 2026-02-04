<template>
  <v-container class="stats-container pa-4">
    <!-- Header -->
    <v-row class="mb-4">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <h1 class="text-h4 font-weight-bold">Statistics</h1>
          <v-btn-toggle v-model="timeRange" mandatory rounded="lg" density="compact">
            <v-btn value="week">Week</v-btn>
            <v-btn value="month">Month</v-btn>
            <v-btn value="year">Year</v-btn>
          </v-btn-toggle>
        </div>
      </v-col>
    </v-row>

    <!-- Overview Cards -->
    <v-row class="mb-4">
      <v-col cols="6">
        <v-card color="success" variant="tonal" rounded="lg">
          <v-card-text>
            <v-icon size="32" class="mb-2">mdi-barcode-scan</v-icon>
            <h2 class="text-h3 font-weight-bold mb-1">47</h2>
            <p class="text-caption">Total Scans</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card color="primary" variant="tonal" rounded="lg">
          <v-card-text>
            <v-icon size="32" class="mb-2">mdi-heart</v-icon>
            <h2 class="text-h3 font-weight-bold mb-1">23</h2>
            <p class="text-caption">Favorites</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Health Score Chart -->
    <v-card class="mb-4" color="surface" rounded="lg">
      <v-card-text>
        <h3 class="text-h6 font-weight-bold mb-4">Health Score Trend</h3>
        <div class="chart-container">
          <svg width="100%" height="200" viewBox="0 0 300 200">
            <polyline
                points="0,150 50,120 100,100 150,80 200,70 250,60 300,50"
                fill="none"
                stroke="#4CAF50"
                stroke-width="3"
            />
            <circle cx="300" cy="50" r="5" fill="#4CAF50" />
          </svg>
        </div>
        <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-2">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>
      </v-card-text>
    </v-card>

    <!-- Nutri-Score Distribution -->
    <v-card class="mb-4" color="surface" rounded="lg">
      <v-card-text>
        <h3 class="text-h6 font-weight-bold mb-4">Nutri-Score Distribution</h3>
        <div class="nutriscore-bars mb-3">
          <div class="score-bar">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-caption">A - Excellent</span>
              <span class="text-caption font-weight-bold">35%</span>
            </div>
            <v-progress-linear :model-value="35" color="success" height="8" rounded></v-progress-linear>
          </div>
          <div class="score-bar">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-caption">B - Good</span>
              <span class="text-caption font-weight-bold">28%</span>
            </div>
            <v-progress-linear :model-value="28" color="success" height="8" rounded></v-progress-linear>
          </div>
          <div class="score-bar">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-caption">C - Fair</span>
              <span class="text-caption font-weight-bold">20%</span>
            </div>
            <v-progress-linear :model-value="20" color="warning" height="8" rounded></v-progress-linear>
          </div>
          <div class="score-bar">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-caption">D - Poor</span>
              <span class="text-caption font-weight-bold">12%</span>
            </div>
            <v-progress-linear :model-value="12" color="orange" height="8" rounded></v-progress-linear>
          </div>
          <div class="score-bar">
            <div class="d-flex justify-space-between mb-1">
              <span class="text-caption">E - Bad</span>
              <span class="text-caption font-weight-bold">5%</span>
            </div>
            <v-progress-linear :model-value="5" color="error" height="8" rounded></v-progress-linear>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Top Categories -->
    <v-card class="mb-20" color="surface" rounded="lg">
      <v-card-text>
        <h3 class="text-h6 font-weight-bold mb-4">Top Categories</h3>
        <v-list bg-color="transparent">
          <v-list-item v-for="(category, i) in topCategories" :key="i" class="px-0">
            <template v-slot:prepend>
              <v-avatar :color="category.color" size="40">
                <v-icon>{{ category.icon }}</v-icon>
              </v-avatar>
            </template>
            <v-list-item-title class="font-weight-bold">{{ category.name }}</v-list-item-title>
            <v-list-item-subtitle>{{ category.count }} items</v-list-item-subtitle>
            <template v-slot:append>
              <span class="text-caption">{{ category.percentage }}%</span>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>

    <!-- Bottom Navigation -->
    <v-bottom-navigation v-model="activeTab" grow color="primary">
      <v-btn value="feed" @click="$router.push('/')">
        <v-icon>mdi-home</v-icon>
        <span>Feed</span>
      </v-btn>
      <v-btn value="explore" @click="$router.push('/explore')">
        <v-icon>mdi-magnify</v-icon>
        <span>Explore</span>
      </v-btn>
      <v-btn value="scan" @click="$router.push('/scanner')">
        <v-icon>mdi-camera</v-icon>
        <span>Scan</span>
      </v-btn>
      <v-btn value="stats">
        <v-icon>mdi-chart-bar</v-icon>
        <span>Stats</span>
      </v-btn>
      <v-btn value="profile" @click="$router.push('/profile')">
        <v-icon>mdi-account</v-icon>
        <span>Profile</span>
      </v-btn>
    </v-bottom-navigation>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeTab = ref('stats')
const timeRange = ref('week')

const topCategories = [
  { name: 'Dairy Products', count: 15, percentage: 32, color: 'success', icon: 'mdi-cow' },
  { name: 'Beverages', count: 12, percentage: 26, color: 'primary', icon: 'mdi-cup' },
  { name: 'Snacks', count: 10, percentage: 21, color: 'warning', icon: 'mdi-food-apple' },
  { name: 'Frozen Foods', count: 7, percentage: 15, color: 'info', icon: 'mdi-snowflake' },
  { name: 'Bakery', count: 3, percentage: 6, color: 'orange', icon: 'mdi-bread-slice' },
]
</script>

<style scoped>
.stats-container {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.chart-container {
  background: rgba(76, 175, 80, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.score-bar {
  margin-bottom: 16px;
}

.score-bar:last-child {
  margin-bottom: 0;
}
</style>