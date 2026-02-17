<template>
  <div class="stats-wrapper">
    <v-container class="stats-container pa-4">
      <!-- Header -->
      <v-row class="mb-4">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-4">
            <h1 class="text-h4 font-weight-bold">Statistics</h1>
          </div>
        </v-col>
      </v-row>

      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-2 text-medium-emphasis mt-4">Loading statistics...</p>
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
                No data available yet. Scan products to see your trend!
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

        <!-- Nutri Score Distribution PIE CHART -->
        <v-card class="mb-4" color="surface" elevation="0" rounded="lg">
          <v-card-title class="d-flex align-center">
            <v-icon class="mr-2">mdi-chart-donut</v-icon>
            Nutri-Score Distribution
          </v-card-title>
          <v-card-text>
            <!-- No Data State -->
            <v-alert v-if="hasNoScoreData" type="info" variant="tonal" rounded="lg">
              <template v-slot:prepend>
                <v-icon size="large">mdi-chart-donut</v-icon>
              </template>
              <div class="text-subtitle-1">No ratings yet</div>
              <div class="text-caption">Scan products with a Nutri-Score to get started!</div>
            </v-alert>

            <!-- Pie Chart -->
            <div v-else>
              <div class="pie-chart-container">
                <svg :width="pieSize" :height="pieSize">
                  <g v-for="slice in pieSlices" :key="slice.grade">
                    <path :d="slice.path" :fill="getScoreColorHex(slice.grade)"
                          stroke="#192328" stroke-width="3" class="pie-slice"
                          @mouseenter="hoveredSlice = slice.grade"
                          @mouseleave="hoveredSlice = null" />
                  </g>
                  <circle :cx="pieSize/2" :cy="pieSize/2" :r="pieSize/4" fill="#192328" />
                  <text :x="pieSize/2" :y="pieSize/2-10" text-anchor="middle"
                        class="pie-center-text-large" fill="white">{{ totalScored }}</text>
                  <text :x="pieSize/2" :y="pieSize/2+15" text-anchor="middle"
                        class="pie-center-text-small" fill="grey">Rated</text>
                </svg>
              </div>

              <!-- Vuetify Legend -->
              <v-list bg-color="transparent" class="mt-4">
                <v-list-item v-for="item in stats.nutriScoreDistribution.filter(i => i.count > 0)"
                             :key="item.grade" rounded="lg" class="legend-item mb-2"
                             @mouseenter="hoveredSlice = item.grade"
                             @mouseleave="hoveredSlice = null">
                  <template v-slot:prepend>
                    <v-avatar :color="getScoreColorHex(item.grade)" size="16" class="mr-3" />
                  </template>
                  <v-list-item-title>
                    <span class="text-subtitle-2 font-weight-bold mr-2">{{ item.grade.toUpperCase() }}</span>
                    <v-chip size="x-small" variant="text">{{ getScoreLabel(item.grade) }}</v-chip>
                  </v-list-item-title>
                  <template v-slot:append>
                    <div class="text-right">
                      <div class="text-subtitle-2 font-weight-bold">{{ item.count }}</div>
                      <div class="text-caption">({{ item.percent }}%)</div>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </div>
          </v-card-text>
        </v-card>

        <!-- Summary Card -->
        <v-card class="mb-20" color="surface" rounded="lg">
          <v-card-text>
            <h3 class="text-h6 font-weight-bold mb-4">Summary</h3>

            <div class="summary-item">
              <v-icon color="success" class="mr-3">mdi-trophy</v-icon>
              <div>
                <h4 class="text-subtitle-2 font-weight-bold">Best Week</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ bestWeekMessage }}
                </p>
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="summary-item">
              <v-icon color="primary" class="mr-3">mdi-target</v-icon>
              <div>
                <h4 class="text-subtitle-2 font-weight-bold">Goal</h4>
                <p class="text-caption text-medium-emphasis">
                  {{ goalMessage }}
                </p>
              </div>
            </div>

            <v-divider class="my-3" />

            <div class="summary-item">
              <v-icon color="warning" class="mr-3">mdi-lightbulb-outline</v-icon>
              <div>
                <h4 class="text-subtitle-2 font-weight-bold">Tip</h4>
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

const hoveredSlice = ref<string | null>(null)
const pieSize = 280
const pieRadius = pieSize / 2 - 20
const pieInnerRadius = pieSize / 4

const hasNoScoreData = computed(() =>
    stats.value.nutriScoreDistribution.every(item => item.count === 0)
)

const totalScored = computed(() =>
    stats.value.nutriScoreDistribution.reduce((sum, item) => sum + item.count, 0)
)

const pieSlices = computed(() => {
  const data = stats.value.nutriScoreDistribution.filter(item => item.count > 0)
  if (data.length === 0) return []

  const total = data.reduce((sum, item) => sum + item.count, 0)
  const centerX = pieSize / 2
  const centerY = pieSize / 2

  let currentAngle = -Math.PI / 2 // Start at top (12 o'clock)

  return data.map(item => {
    const angle = (item.count / total) * 2 * Math.PI
    const endAngle = currentAngle + angle

    // Calculate outer arc points
    const x1 = centerX + pieRadius * Math.cos(currentAngle)
    const y1 = centerY + pieRadius * Math.sin(currentAngle)
    const x2 = centerX + pieRadius * Math.cos(endAngle)
    const y2 = centerY + pieRadius * Math.sin(endAngle)

    // Calculate inner arc points
    const x3 = centerX + pieInnerRadius * Math.cos(endAngle)
    const y3 = centerY + pieInnerRadius * Math.sin(endAngle)
    const x4 = centerX + pieInnerRadius * Math.cos(currentAngle)
    const y4 = centerY + pieInnerRadius * Math.sin(currentAngle)

    const largeArc = angle > Math.PI ? 1 : 0

    // Create donut slice path
    const path = [
      `M ${x1} ${y1}`,
      `A ${pieRadius} ${pieRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${pieInnerRadius} ${pieInnerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ')

    currentAngle = endAngle

    return {
      grade: item.grade,
      path,
      percent: item.percent
    }
  })
})

const getScoreColorHex = (grade: string): string => ({
  A: '#4CAF50', B: '#8BC34A', C: '#FFC107',
  D: '#FF9800', E: '#F44336'
}[grade.toUpperCase()] || '#9E9E9E')

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
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  })
})

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
  if (trend.length === 0) return 'No data available yet'

  const validScores = trend.filter(d => d.score !== null)
  if (validScores.length === 0) return 'No scans this week yet'

  const avgScore = validScores.reduce((sum, d) => sum + d.score!, 0) / validScores.length

  if (avgScore < 0) return 'This week was excellent! 🎉'
  if (avgScore < 10) return 'Great week! Keep it up!'
  if (avgScore < 20) return 'Good week with room to improve'
  return 'There is room for improvement'
})

const goalMessage = computed(() => {
  const aCount = stats.value.nutriScoreDistribution.find(d => d.grade === 'A')?.count || 0
  const totalScans = stats.value.totalScans

  if (totalScans === 0) return 'Scan 10 products to reach your first goal!'

  const aPercent = (aCount / totalScans) * 100

  if (aPercent >= 50) return 'Goal reached! 50%+ products with an A rating! 🎯'

  const remaining = Math.ceil((totalScans * 0.5) - aCount)
  return `${remaining} more A-rated products to reach the 50% goal`
})

const tipMessage = computed(() => {
  const dist = stats.value.nutriScoreDistribution
  const dCount = dist.find(d => d.grade === 'D')?.count || 0
  const eCount = dist.find(d => d.grade === 'E')?.count || 0

  if (dCount + eCount > stats.value.totalScans * 0.3) {
    return 'Try to avoid products with a D or E rating and look for healthier alternatives.'
  }

  const aCount = dist.find(d => d.grade === 'A')?.count || 0
  const bCount = dist.find(d => d.grade === 'B')?.count || 0

  if (aCount + bCount > stats.value.totalScans * 0.7) {
    return 'Great job! You are mostly choosing healthy products. Keep it up!'
  }

  return 'Next time you shop, pay attention to the Nutri-Score on products.'
})

// Load stats from API
onMounted(async () => {
  try {
    const data = await authAPI.getStats()
    if (data) {
      stats.value = data
    }
  } catch (error) {
    console.error('Failed to load statistics:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
.pie-chart-container { display: flex; justify-content: center; padding: 20px; }
.pie-slice { cursor: pointer; transition: all 0.3s; }
.pie-slice:hover { opacity: 0.85; filter: brightness(1.15); }
.pie-center-text-large { font-size: 36px; font-weight: bold; }
.pie-center-text-small { font-size: 14px; }
.legend-item { transition: all 0.2s; cursor: pointer; }
.legend-item:hover { background-color: rgba(var(--v-theme-surface-variant), 0.3) !important; }
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