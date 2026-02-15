<template>
  <div class="stats-wrapper">
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

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-2 text-medium-emphasis mt-4">Lade Statistiken...</p>
      </div>

      <template v-else>
        <!-- Overview Cards -->
        <v-row class="mb-4">
          <v-col cols="6">
            <v-card color="success" variant="tonal" rounded="lg">
              <v-card-text>
                <v-icon size="32" class="mb-2">mdi-barcode-scan</v-icon>
                <h2 class="text-h3 font-weight-bold mb-1">{{ stats.totalScans }}</h2>
                <p class="text-caption">Total Scans</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="6">
            <v-card color="primary" variant="tonal" rounded="lg">
              <v-card-text>
                <v-icon size="32" class="mb-2">mdi-heart</v-icon>
                <h2 class="text-h3 font-weight-bold mb-1">{{ stats.totalFavorites }}</h2>
                <p class="text-caption">Favorites</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Health Score Trend Chart -->
        <v-card class="mb-4" color="surface" rounded="lg">
          <v-card-text>
            <h3 class="text-h6 font-weight-bold mb-4">Health Score Trend</h3>

            <!-- No Data State -->
            <div v-if="stats.healthScoreTrend.length === 0" class="text-center py-4">
              <v-icon size="64" color="grey">mdi-chart-line</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">
                Noch keine Daten verfügbar. Scanne Produkte um deinen Trend zu sehen!
              </p>
            </div>

            <!-- Chart -->
            <div v-else class="chart-container">
              <svg width="100%" height="200" :viewBox="`0 0 ${chartWidth} 200`">
                <!-- Grid lines -->
                <line
                    v-for="i in 5"
                    :key="`grid-${i}`"
                    :x1="0"
                    :y1="i * 40"
                    :x2="chartWidth"
                    :y2="i * 40"
                    stroke="rgba(255,255,255,0.1)"
                    stroke-width="1"
                />

                <!-- Trend Line -->
                <polyline
                    v-if="trendPoints"
                    :points="trendPoints"
                    fill="none"
                    stroke="#4CAF50"
                    stroke-width="3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />

                <!-- Data Points -->
                <circle
                    v-for="(point, index) in parsedTrendData.filter(p => p.y !== null)"
                    :key="`point-${index}`"
                    :cx="point.x"
                    :cy="point.y"
                    r="5"
                    fill="#4CAF50"
                />
              </svg>
            </div>

            <!-- Labels -->
            <div v-if="stats.healthScoreTrend.length > 0" class="d-flex justify-space-between text-caption text-medium-emphasis mt-2">
              <span v-for="(day, index) in dayLabels" :key="`label-${index}`">{{ day }}</span>
            </div>
          </v-card-text>
        </v-card>

        <!-- Nutri Score Distribution -->
        <v-card class="mb-4" color="surface" rounded="lg">
          <v-card-text>
            <h3 class="text-h6 font-weight-bold mb-4">Nutri-Score Distribution</h3>

            <!-- No Data State -->
            <div v-if="stats.nutriScoreDistribution.length === 0" class="text-center py-4">
              <v-icon size="64" color="grey">mdi-chart-donut</v-icon>
              <p class="text-body-2 text-medium-emphasis mt-2">
                Noch keine Produkte gescannt
              </p>
            </div>

            <!-- Distribution Bars -->
            <div v-else>
              <div v-for="item in stats.nutriScoreDistribution" :key="item.grade" class="score-bar">
                <div class="d-flex justify-space-between mb-1">
                  <span class="text-caption">
                    {{ item.grade.toUpperCase() }} - {{ getScoreLabel(item.grade) }}
                  </span>
                  <span class="text-caption font-weight-bold">
                    {{ item.count }} ({{ item.percent }}%)
                  </span>
                </div>
                <v-progress-linear
                    :model-value="item.percent"
                    :color="getScoreColor(item.grade)"
                    height="8"
                    rounded
                />
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Summary Card -->
        <v-card class="mb-20" color="surface" rounded="lg">
          <v-card-text>
            <h3 class="text-h6 font-weight-bold mb-4">Zusammenfassung</h3>

            <div class="summary-item">
              <v-icon color="success" class="mr-3">mdi-trophy</v-icon>
              <div>
                <h4 class="text-subtitle-2 font-weight-bold">Beste Woche</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ bestWeekMessage }}
                </p>
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="summary-item">
              <v-icon color="primary" class="mr-3">mdi-target</v-icon>
              <div>
                <h4 class="text-subtitle-2 font-weight-bold">Ziel</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ goalMessage }}
                </p>
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="summary-item">
              <v-icon color="warning" class="mr-3">mdi-lightbulb-outline</v-icon>
              <div>
                <h4 class="text-subtitle-2 font-weight-bold">Tipp</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ tipMessage }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </template>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { authAPI } from '@/services/api'

const timeRange = ref('week')
const isLoading = ref(true)

const stats = ref({
  totalScans: 0,
  totalFavorites: 0,
  healthScoreTrend: [] as Array<{ date: string; score: number | null }>,
  nutriScoreDistribution: [] as Array<{ grade: string; count: number; percent: number }>
})

// Chart dimensions
const chartWidth = 300
const chartHeight = 200
const padding = 10

// Parse trend data for chart
const parsedTrendData = computed(() => {
  const trend = stats.value.healthScoreTrend
  if (trend.length === 0) return []

  const validData = trend.map((d, i) => ({
    index: i,
    value: d.score,
    date: d.date
  }))

  const xStep = (chartWidth - 2 * padding) / Math.max(trend.length - 1, 1)

  // Find min/max for y-axis scaling (Nutriscore: -15 to +40)
  const minScore = -15
  const maxScore = 40
  const range = maxScore - minScore

  return validData.map((d, i) => {
    const x = padding + i * xStep
    // Higher score = worse, so invert Y axis
    const y = d.value !== null
        ? chartHeight - padding - ((d.value - minScore) / range) * (chartHeight - 2 * padding)
        : null

    return { x, y, value: d.value }
  })
})

// Generate polyline points string
const trendPoints = computed(() => {
  const points = parsedTrendData.value.filter(p => p.y !== null)
  if (points.length === 0) return ''
  return points.map(p => `${p.x},${p.y}`).join(' ')
})

// Day labels
const dayLabels = computed(() => {
  const trend = stats.value.healthScoreTrend
  if (trend.length === 0) return []

  return trend.map(d => {
    const date = new Date(d.date)
    return date.toLocaleDateString('de-DE', { weekday: 'short' })
  })
})

// Score helpers
const getScoreColor = (grade: string): string => {
  const colors: Record<string, string> = {
    A: 'success',
    B: 'light-green',
    C: 'warning',
    D: 'orange',
    E: 'error',
  }
  return colors[grade.toUpperCase()] || 'grey'
}

const getScoreLabel = (grade: string): string => {
  const labels: Record<string, string> = {
    A: 'Excellent',
    B: 'Good',
    C: 'Fair',
    D: 'Poor',
    E: 'Bad',
  }
  return labels[grade.toUpperCase()] || 'Unknown'
}

// Summary messages
const bestWeekMessage = computed(() => {
  const trend = stats.value.healthScoreTrend
  if (trend.length === 0) return 'Noch keine Daten verfügbar'

  const validScores = trend.filter(d => d.score !== null)
  if (validScores.length === 0) return 'Noch keine Scans diese Woche'

  const avgScore = validScores.reduce((sum, d) => sum + d.score!, 0) / validScores.length

  if (avgScore < 0) return 'Diese Woche war ausgezeichnet! 🎉'
  if (avgScore < 10) return 'Sehr gute Woche! Weiter so!'
  if (avgScore < 20) return 'Gute Woche mit Verbesserungspotential'
  return 'Es gibt Raum für Verbesserungen'
})

const goalMessage = computed(() => {
  const aCount = stats.value.nutriScoreDistribution.find(d => d.grade === 'A')?.count || 0
  const totalScans = stats.value.totalScans

  if (totalScans === 0) return 'Scanne 10 Produkte um dein erstes Ziel zu erreichen!'

  const aPercent = (aCount / totalScans) * 100

  if (aPercent >= 50) return 'Ziel erreicht! 50%+ Produkte mit A-Rating! 🎯'

  const remaining = Math.ceil((totalScans * 0.5) - aCount)
  return `Noch ${remaining} A-Produkte bis zum 50% Ziel`
})

const tipMessage = computed(() => {
  const dist = stats.value.nutriScoreDistribution
  const dCount = dist.find(d => d.grade === 'D')?.count || 0
  const eCount = dist.find(d => d.grade === 'E')?.count || 0

  if (dCount + eCount > stats.value.totalScans * 0.3) {
    return 'Versuche, Produkte mit D oder E Rating zu vermeiden und nach Alternativen zu suchen.'
  }

  const aCount = dist.find(d => d.grade === 'A')?.count || 0
  const bCount = dist.find(d => d.grade === 'B')?.count || 0

  if (aCount + bCount > stats.value.totalScans * 0.7) {
    return 'Großartig! Du wählst überwiegend gesunde Produkte. Weiter so!'
  }

  return 'Achte beim nächsten Einkauf bewusst auf den Nutri-Score der Produkte.'
})

// Load stats from API
onMounted(async () => {
  try {
    const data = await authAPI.getStats()
    if (data) {
      stats.value = data
    }
  } catch (error) {
    console.error('Fehler beim Laden der Statistiken:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
/* Wrapper with proper height and scrolling */
.stats-wrapper {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

.stats-container {
  max-width: 600px;
  margin: 0 auto;
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

.summary-item {
  display: flex;
  align-items: flex-start;
}
</style>