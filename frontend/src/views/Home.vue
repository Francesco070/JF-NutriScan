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
            <h1 class="text-h4 font-weight-bold mb-1">
              Hallo, {{ userFirstName }} 👋
            </h1>
            <p class="text-body-2 text-medium-emphasis">Keep up the great habits!</p>
          </div>
          <v-btn icon variant="text">
            <v-icon>mdi-bell-outline</v-icon>
          </v-btn>
        </v-col>
      </v-row>

      <!-- Loading Stats -->
      <div v-if="isLoadingStats" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-2 text-medium-emphasis mt-4">Lade Statistiken...</p>
      </div>

      <!-- Stats Cards -->
      <v-row v-else class="mb-4">
        <v-col cols="6">
          <v-card class="stat-card" color="surface" rounded="lg">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="primary" size="20" class="mr-2">mdi-barcode-scan</v-icon>
                <span class="text-caption text-medium-emphasis">Scanned Today</span>
              </div>
              <h2 class="text-h4 font-weight-bold">{{ stats.totalScans }} items</h2>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="6">
          <v-card class="stat-card" color="surface" rounded="lg">
            <v-card-text>
              <div class="d-flex align-center mb-2">
                <v-icon color="success" size="20" class="mr-2">mdi-heart-outline</v-icon>
                <span class="text-caption text-medium-emphasis">Favorites</span>
              </div>
              <h2 class="text-h4 font-weight-bold">{{ stats.totalFavorites }}</h2>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Weekly Progress -->
      <v-card class="mb-4" color="surface" rounded="lg">
        <v-card-text>
          <div class="d-flex justify-space-between align-center mb-2">
            <h3 class="text-subtitle-1 font-weight-bold">Weekly Health Score</h3>
            <v-chip :color="weeklyScoreColor" size="small" variant="flat">
              {{ weeklyScoreLabel }}
            </v-chip>
          </div>
          <v-progress-linear
              :model-value="weeklyScorePercent"
              :color="weeklyScoreColor"
              height="8"
              rounded
              class="mb-2"
          ></v-progress-linear>
          <p class="text-caption text-medium-emphasis">
            {{ weeklyScoreMessage }}
          </p>
        </v-card-text>
      </v-card>

      <!-- Recent Scans -->
      <div class="d-flex justify-space-between align-center mb-3">
        <h3 class="text-h6 font-weight-bold">Recent Scans</h3>
        <v-btn variant="text" color="primary" size="small" @click="router.push('/explore')">
          See All
        </v-btn>
      </div>

      <!-- Loading Recent Products -->
      <div v-if="isLoadingRecent" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>

      <!-- Recent Products Grid -->
      <v-row v-else-if="recentProducts.length > 0" class="mb-4">
        <v-col v-for="product in recentProducts.slice(0, 4)" :key="product.barcode" cols="6">
          <v-card class="product-card" color="surface" rounded="lg" @click="viewProduct(product.barcode)">
            <v-img
                v-if="product.imageUrl"
                :src="product.imageUrl"
                height="140"
                cover
                class="product-image"
            >
              <template v-slot:placeholder>
                <v-row class="fill-height ma-0" align="center" justify="center">
                  <v-progress-circular indeterminate color="grey"></v-progress-circular>
                </v-row>
              </template>
            </v-img>
            <v-avatar v-else size="140" color="grey-lighten-3" class="product-image">
              <v-icon size="64" color="grey-darken-1">mdi-image-off-outline</v-icon>
            </v-avatar>
            <v-card-text class="pa-3">
              <v-chip
                  v-if="product.nutriscore?.grade"
                  :color="getNutriscoreColor(product.nutriscore.grade)"
                  size="x-small"
                  class="mb-2"
              >
                {{ product.nutriscore.grade.toUpperCase() }}
              </v-chip>
              <h4 class="text-subtitle-2 font-weight-bold mb-1">
                {{ product.name || 'Unbekanntes Produkt' }}
              </h4>
              <p class="text-caption text-medium-emphasis">
                {{ product.brand || 'Keine Marke' }} • {{ product.nutriments.energyKcal100g || '?' }} kcal
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- No Recent Scans -->
      <v-card v-else class="mb-4" color="surface" rounded="lg">
        <v-card-text class="text-center pa-6">
          <v-icon size="64" color="grey">mdi-barcode-scan</v-icon>
          <h3 class="text-h6 font-weight-bold mt-4 mb-2">Noch keine Scans</h3>
          <p class="text-body-2 text-medium-emphasis mb-4">
            Starte jetzt mit dem Scannen von Produkten!
          </p>
          <v-btn color="primary" @click="router.push('/scanner')">
            <v-icon left>mdi-camera</v-icon>
            Jetzt scannen
          </v-btn>
        </v-card-text>
      </v-card>

      <!-- Daily Insight -->
      <v-card color="surface" rounded="lg">
        <v-card-text>
          <h3 class="text-subtitle-1 font-weight-bold mb-3">Daily Insight</h3>
          <div class="d-flex">
            <v-avatar color="success" size="40" class="mr-3">
              <v-icon>mdi-lightbulb-outline</v-icon>
            </v-avatar>
            <div>
              <h4 class="text-subtitle-2 font-weight-bold mb-1">{{ dailyInsight.title }}</h4>
              <p class="text-caption text-medium-emphasis">
                {{ dailyInsight.message }}
              </p>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProductsStore } from '@/stores/products'
import { authAPI } from '@/services/api'

const router = useRouter()
const authStore = useAuthStore()
const productsStore = useProductsStore()

const isLoadingStats = ref(true)
const isLoadingRecent = ref(true)

const stats = ref({
  totalScans: 0,
  totalFavorites: 0,
  healthScoreTrend: [] as Array<{ date: string; score: number | null }>,
  nutriScoreDistribution: [] as Array<{ grade: string; count: number; percent: number }>
})

const userFirstName = computed(() => authStore.user?.firstname || 'User')

const recentProducts = computed(() => productsStore.recentProducts || [])

// Weekly Score Calculation
const weeklyScorePercent = computed(() => {
  const trend = stats.value.healthScoreTrend
  if (trend.length === 0) return 0

  const validScores = trend.filter(d => d.score !== null).map(d => d.score!)
  if (validScores.length === 0) return 0

  const avgScore = validScores.reduce((sum, score) => sum + score, 0) / validScores.length
  // Nutriscore geht von -15 (beste) bis +40 (schlechteste)
  // Umrechnen zu 0-100 (höher = besser)
  return Math.max(0, Math.min(100, ((40 - avgScore) / 55) * 100))
})

const weeklyScoreColor = computed(() => {
  const percent = weeklyScorePercent.value
  if (percent >= 80) return 'success'
  if (percent >= 60) return 'warning'
  return 'error'
})

const weeklyScoreLabel = computed(() => {
  const percent = weeklyScorePercent.value
  if (percent >= 80) return 'Excellent'
  if (percent >= 60) return 'Good'
  if (percent >= 40) return 'Fair'
  return 'Needs Improvement'
})

const weeklyScoreMessage = computed(() => {
  const aCount = stats.value.nutriScoreDistribution.find(d => d.grade === 'A')?.count || 0
  const totalProducts = stats.value.totalScans

  if (totalProducts === 0) {
    return 'Scanne Produkte um deinen Health Score zu tracken.'
  }

  const aPercent = (aCount / totalProducts) * 100
  return `Du hast diese Woche ${aPercent.toFixed(0)}% Produkte mit Top-Bewertung gescannt!`
})

const dailyInsight = computed(() => {
  const dist = stats.value.nutriScoreDistribution
  const aCount = dist.find(d => d.grade === 'A')?.count || 0
  const bCount = dist.find(d => d.grade === 'B')?.count || 0
  const goodCount = aCount + bCount

  if (goodCount > stats.value.totalScans * 0.7) {
    return {
      title: 'Großartige Auswahl!',
      message: `${goodCount} deiner letzten Scans haben eine gute Bewertung. Weiter so!`
    }
  }

  return {
    title: 'Tipp des Tages',
    message: 'Achte auf Produkte mit Nutri-Score A oder B für eine gesündere Ernährung.'
  }
})

const viewProduct = (barcode: string) => {
  router.push(`/product/${barcode}`)
}

const getNutriscoreColor = (grade: string): string => {
  const colors: Record<string, string> = {
    a: 'success',
    b: 'light-green',
    c: 'yellow-darken-2',
    d: 'orange',
    e: 'error',
  }
  return colors[grade.toLowerCase()] || 'grey'
}

onMounted(async () => {
  // Lade User Stats
  try {
    const statsData = await authAPI.getStats()
    if (statsData) {
      stats.value = statsData
    }
  } catch (error) {
    console.error('Fehler beim Laden der Stats:', error)
  } finally {
    isLoadingStats.value = false
    isLoadingRecent.value = false
  }
})
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