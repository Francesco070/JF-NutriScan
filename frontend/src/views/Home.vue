<template>
  <v-container class="home-container pa-4" fluid>
    <!-- Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h2 class="text-h5 font-weight-bold">Good {{ timeOfDay }}, {{ firstName }} 👋</h2>
        <p class="text-body-2 text-medium-emphasis">What are you scanning today?</p>
      </div>
      <v-avatar
          size="44"
          color="primary"
          style="cursor:pointer"
          @click="$router.push('/profile')"
      >
        <span class="text-subtitle-1 font-weight-bold">{{ initials }}</span>
      </v-avatar>
    </div>

    <!-- Quick Scan CTA -->
    <v-card class="scan-cta mb-6" rounded="xl" @click="$router.push('/scanner')" elevation="0">
      <div class="scan-cta-bg" />
      <v-card-text class="d-flex align-center pa-5">
        <div class="flex-grow-1">
          <h3 class="text-h6 font-weight-bold mb-1" style="color:white">Scan a Product</h3>
          <p class="text-body-2 mb-0" style="color:rgba(255,255,255,0.75)">Point your camera at any barcode</p>
        </div>
        <div class="scan-icon-wrapper">
          <v-icon size="40" color="white">mdi-barcode-scan</v-icon>
        </div>
      </v-card-text>
    </v-card>

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

    <!-- Stats Row -->
    <v-row class="mb-5" dense>
      <v-col cols="4">
        <v-card color="surface" rounded="lg" elevation="0" class="stat-card">
          <v-card-text class="pa-3 text-center">
            <v-progress-circular v-if="loadingStats" indeterminate size="20" color="primary" />
            <template v-else>
              <v-icon color="primary" size="24" class="mb-1">mdi-barcode-scan</v-icon>
              <div class="text-h6 font-weight-bold">{{ stats.totalScans }}</div>
              <div class="text-caption text-medium-emphasis">Scans</div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card color="surface" rounded="lg" elevation="0" class="stat-card">
          <v-card-text class="pa-3 text-center">
            <v-progress-circular v-if="loadingStats" indeterminate size="20" color="error" />
            <template v-else>
              <v-icon color="error" size="24" class="mb-1">mdi-heart</v-icon>
              <div class="text-h6 font-weight-bold">{{ stats.totalFavorites }}</div>
              <div class="text-caption text-medium-emphasis">Favorites</div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="4">
        <v-card color="surface" rounded="lg" elevation="0" class="stat-card">
          <v-card-text class="pa-3 text-center">
            <v-progress-circular v-if="loadingStats" indeterminate size="20" color="success" />
            <template v-else>
              <v-icon color="success" size="24" class="mb-1">mdi-trending-up</v-icon>
              <div class="text-h6 font-weight-bold">{{ avgScore }}</div>
              <div class="text-caption text-medium-emphasis">Avg Score</div>
            </template>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Scans -->
    <div class="d-flex align-center justify-space-between mb-3">
      <h3 class="text-subtitle-1 font-weight-bold">Recent Scans</h3>
      <v-btn
          v-if="recentScans.length > 0"
          variant="text"
          size="small"
          color="primary"
          @click="$router.push('/explore')"
      >
        See all
      </v-btn>
    </div>

    <div v-if="recentScans.length === 0" class="text-center py-10 mb-8">
      <v-icon size="72" color="grey-darken-1" class="mb-4">mdi-barcode-scan</v-icon>
      <h4 class="text-subtitle-1 font-weight-bold mb-2">No scans yet</h4>
      <p class="text-body-2 text-medium-emphasis mb-5">Scan your first product to get started</p>
      <v-btn color="primary" rounded="xl" @click="$router.push('/scanner')">
        <v-icon start>mdi-camera</v-icon>
        Start Scanning
      </v-btn>
    </div>

    <div v-else class="mb-8">
      <v-card
          v-for="item in recentScans.slice(0, 6)"
          :key="item.barcode"
          class="recent-item mb-3"
          rounded="xl"
          elevation="0"
          @click="$router.push(`/product/${item.barcode}`)"
      >
        <v-card-text class="d-flex align-center pa-4" style="gap:12px">
          <v-avatar size="56" rounded="lg" :color="item.imageUrl ? undefined : 'grey-darken-2'">
            <v-img v-if="item.imageUrl" :src="item.imageUrl" cover />
            <v-icon v-else size="28" color="grey">mdi-image-off-outline</v-icon>
          </v-avatar>
          <div class="flex-grow-1" style="min-width:0">
            <div class="text-subtitle-2 font-weight-bold text-truncate">
              {{ item.name || 'Unknown Product' }}
            </div>
            <div class="text-caption text-medium-emphasis text-truncate">
              {{ item.brand || 'No brand' }} · {{ getRelativeTime(item.scannedAt) }}
            </div>
          </div>
          <v-chip
              v-if="item.nutriscore?.grade"
              :color="getNutriScoreColor(item.nutriscore.grade)"
              size="small"
              variant="flat"
          >
            {{ item.nutriscore.grade.toUpperCase() }}
          </v-chip>
          <v-icon color="grey" size="20">mdi-chevron-right</v-icon>
        </v-card-text>
      </v-card>
    </div>

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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { authAPI } from '@/services/api'
import { useRecentScans } from '@/composables/useRecentScans'

const authStore = useAuthStore()
const { recentScans, getRelativeTime } = useRecentScans()

const loadingStats = ref(true)
const stats = ref({ totalScans: 0, totalFavorites: 0, healthScoreTrend: [] as any[] })

onMounted(async () => {
  try {
    const data = await authAPI.getStats()
    if (data) stats.value = data
  } catch (e) {
    console.error('Failed to load stats:', e)
  } finally {
    loadingStats.value = false
  }
})

const firstName = computed(() => authStore.user?.firstname || 'there')

const initials = computed(() => {
  const u = authStore.user
  if (!u) return '?'
  return `${u.firstname?.[0] ?? ''}${u.lastname?.[0] ?? ''}`.toUpperCase()
})

const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

const avgScore = computed(() => {
  const trend = stats.value.healthScoreTrend?.filter((d: any) => d.score !== null)
  if (!trend?.length) return '-'
  const avg = trend.reduce((s: number, d: any) => s + d.score, 0) / trend.length
  return Math.round(avg)
})

function getNutriScoreColor(grade: string): string {
  const colors: Record<string, string> = {
    a: 'success', A: 'success', b: 'light-green', B: 'light-green',
    c: 'warning', C: 'warning', d: 'orange', D: 'orange',
    e: 'error', E: 'error',
  }
  return colors[grade] || 'grey'
}
</script>

<style scoped>
.home-container { max-width: 600px; margin: 0 auto; }

.scan-cta {
  background: linear-gradient(135deg, #2e7d32, #43a047) !important;
  cursor: pointer; position: relative; overflow: hidden;
}
.scan-cta-bg {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 60%);
  pointer-events: none;
}
.scan-icon-wrapper {
  width: 64px; height: 64px; background: rgba(255,255,255,0.15);
  border-radius: 16px; display: flex; align-items: center; justify-content: center;
}
.stat-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.recent-item {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
}
.recent-item:hover { opacity: 0.85; }
</style>