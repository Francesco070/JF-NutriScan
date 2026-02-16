<template>
  <v-container class="explorer-container pa-4" fluid>
    <h2 class="text-h5 font-weight-bold mb-4">Explorer</h2>

    <!-- Search -->
    <v-text-field
        v-model="searchQuery"
        placeholder="Search by name, brand or barcode..."
        prepend-inner-icon="mdi-magnify"
        :append-inner-icon="searchQuery ? 'mdi-close' : undefined"
        @click:append-inner="searchQuery = ''"
        variant="outlined"
        hide-details
        class="mb-5"
    />

    <!-- Tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-4">
      <v-tab value="recent">
        <v-icon start size="18">mdi-history</v-icon>
        Recent
        <v-chip v-if="recentScans.length" size="x-small" class="ml-2">{{ recentScans.length }}</v-chip>
      </v-tab>
      <v-tab value="favorites">
        <v-icon start size="18">mdi-heart</v-icon>
        Favorites
        <v-chip v-if="favorites.length" size="x-small" class="ml-2">{{ favorites.length }}</v-chip>
      </v-tab>
    </v-tabs>

    <v-tabs-window v-model="activeTab">

      <!-- RECENT TAB -->
      <v-tabs-window-item value="recent">
        <div v-if="filteredRecent.length === 0" class="text-center py-12">
          <v-icon size="72" color="grey-darken-1" class="mb-4">mdi-history</v-icon>
          <h4 class="text-subtitle-1 font-weight-bold mb-2">
            {{ searchQuery ? 'No results found' : 'No scans yet' }}
          </h4>
          <p class="text-body-2 text-medium-emphasis mb-5">
            {{ searchQuery ? 'Try a different search term' : 'Scan your first product to see it here' }}
          </p>
          <v-btn v-if="!searchQuery" color="primary" rounded="xl" @click="$router.push('/scanner')">
            <v-icon start>mdi-camera</v-icon>
            Start Scanning
          </v-btn>
        </div>

        <div v-else>
          <v-card
              v-for="item in filteredRecent"
              :key="item.barcode"
              class="product-item mb-3"
              rounded="xl"
              elevation="0"
              @click="$router.push(`/product/${item.barcode}`)"
          >
            <v-card-text class="d-flex align-center pa-4" style="gap:12px">
              <v-avatar size="52" rounded="lg" :color="item.imageUrl ? undefined : 'grey-darken-2'">
                <v-img v-if="item.imageUrl" :src="item.imageUrl" cover />
                <v-icon v-else color="grey" size="24">mdi-image-off-outline</v-icon>
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
              <v-icon color="grey" size="18">mdi-chevron-right</v-icon>
            </v-card-text>
          </v-card>
        </div>
      </v-tabs-window-item>

      <!-- FAVORITES TAB -->
      <v-tabs-window-item value="favorites">
        <div v-if="loadingFavorites" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else-if="filteredFavorites.length === 0" class="text-center py-12">
          <v-icon size="72" color="grey-darken-1" class="mb-4">mdi-heart-outline</v-icon>
          <h4 class="text-subtitle-1 font-weight-bold mb-2">
            {{ searchQuery ? 'No favorites match' : 'No favorites yet' }}
          </h4>
          <p class="text-body-2 text-medium-emphasis">
            {{ searchQuery ? 'Try a different search term' : 'Heart a product to save it here' }}
          </p>
        </div>

        <div v-else>
          <v-card
              v-for="item in filteredFavorites"
              :key="item.barcode"
              class="product-item mb-3"
              rounded="xl"
              elevation="0"
              @click="$router.push(`/product/${item.barcode}`)"
          >
            <v-card-text class="d-flex align-center pa-4" style="gap:12px">
              <v-avatar size="52" rounded="lg" :color="item.imageUrl ? undefined : 'grey-darken-2'">
                <v-img v-if="item.imageUrl" :src="item.imageUrl" cover />
                <v-icon v-else color="grey" size="24">mdi-image-off-outline</v-icon>
              </v-avatar>
              <div class="flex-grow-1" style="min-width:0">
                <div class="text-subtitle-2 font-weight-bold text-truncate">
                  {{ item.name || 'Unknown Product' }}
                </div>
                <div class="text-caption text-medium-emphasis text-truncate">
                  {{ item.brand || 'No brand' }}
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
              <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  color="error"
                  @click.stop="removeFavorite(item.barcode)"
              >
                <v-icon size="18">mdi-heart-off</v-icon>
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </v-tabs-window-item>

    </v-tabs-window>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { productsAPI } from '@/services/api'
import { useRecentScans } from '@/composables/useRecentScans'

const { recentScans, getRelativeTime } = useRecentScans()

const activeTab = ref('recent')
const searchQuery = ref('')
const loadingFavorites = ref(false)
const favorites = ref<any[]>([])

onMounted(async () => {
  loadingFavorites.value = true
  try {
    const data = await productsAPI.getFavorites()
    if (Array.isArray(data)) favorites.value = data
  } catch (e) {
    console.error('Failed to load favorites:', e)
  } finally {
    loadingFavorites.value = false
  }
})

const filteredRecent = computed(() => {
  if (!searchQuery.value) return recentScans.value
  const q = searchQuery.value.toLowerCase()
  return recentScans.value.filter(p =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.barcode.includes(q)
  )
})

const filteredFavorites = computed(() => {
  if (!searchQuery.value) return favorites.value
  const q = searchQuery.value.toLowerCase()
  return favorites.value.filter((p: any) =>
      p.name?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.barcode?.includes(q)
  )
})

async function removeFavorite(barcode: string) {
  try {
    await productsAPI.removeFromFavorites(barcode)
    favorites.value = favorites.value.filter((p: any) => p.barcode !== barcode)
  } catch (e) {
    console.error('Failed to remove favorite:', e)
  }
}

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
.explorer-container { max-width: 600px; margin: 0 auto; }
.product-item {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: opacity 0.2s;
}
.product-item:hover { opacity: 0.85; }
</style>