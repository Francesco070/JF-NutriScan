<template>
  <div class="explorer-wrapper">
    <v-container class="explorer-container pa-4" fluid>
      <h2 class="text-h5 font-weight-bold mb-4">Explorer</h2>

      <!-- Search + Barcode Input -->
      <div class="search-section mb-4">
        <v-text-field
            v-model="searchQuery"
            :placeholder="activeTab === 'barcode' ? 'Enter barcode number...' : 'Search by name, brand or barcode...'"
            :prepend-inner-icon="activeTab === 'barcode' ? 'mdi-barcode' : 'mdi-magnify'"
            :append-inner-icon="searchQuery ? 'mdi-close' : undefined"
            @click:append-inner="searchQuery = ''"
            @keyup.enter="activeTab === 'barcode' ? lookupBarcode() : undefined"
            variant="outlined"
            hide-details
            :type="activeTab === 'barcode' ? 'number' : 'text'"
            inputmode="numeric"
        />

        <!-- Barcode Lookup Button (only visible in barcode tab) -->
        <v-btn
            v-if="activeTab === 'barcode'"
            color="primary"
            size="large"
            block
            class="mt-3"
            :loading="barcodeLoading"
            :disabled="!searchQuery.trim()"
            @click="lookupBarcode"
            rounded="xl"
        >
          <v-icon start>mdi-magnify</v-icon>
          Look up Product
        </v-btn>
      </div>

      <!-- Barcode Error Alert -->
      <v-alert
          v-if="barcodeError"
          type="error"
          variant="tonal"
          density="compact"
          rounded="xl"
          class="mb-4"
          closable
          @click:close="barcodeError = ''"
      >
        {{ barcodeError }}
      </v-alert>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" color="primary" class="mb-4" align-tabs="center">
        <v-tab value="recent">
          <v-icon size="25">mdi-history</v-icon>
          <v-chip v-if="recentScans.length" size="x-small" class="ml-2">{{ recentScans.length }}</v-chip>
        </v-tab>
        <v-tab value="favorites">
          <v-icon size="25">mdi-heart</v-icon>
          <v-chip v-if="favorites.length" size="x-small" class="ml-2">{{ favorites.length }}</v-chip>
        </v-tab>
        <v-tab value="barcode">
          <v-icon size="25">mdi-barcode-scan</v-icon>
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
          <!-- Loading -->
          <div v-if="loadingFavorites" class="d-flex justify-center py-12">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <!-- Error loading favorites -->
          <v-alert
              v-else-if="favoritesError"
              type="error"
              variant="tonal"
              rounded="xl"
              class="mb-4"
          >
            {{ favoritesError }}
            <template v-slot:append>
              <v-btn variant="text" size="small" @click="loadFavorites">Retry</v-btn>
            </template>
          </v-alert>

          <!-- Empty state -->
          <div v-else-if="filteredFavorites.length === 0" class="text-center py-12">
            <v-icon size="72" color="grey-darken-1" class="mb-4">mdi-heart-outline</v-icon>
            <h4 class="text-subtitle-1 font-weight-bold mb-2">
              {{ searchQuery ? 'No favorites match' : 'No favorites yet' }}
            </h4>
            <p class="text-body-2 text-medium-emphasis">
              {{ searchQuery ? 'Try a different search term' : 'Heart a product to save it here' }}
            </p>
          </div>

          <!-- Favorites list -->
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
                <v-icon color="grey" size="18">mdi-chevron-right</v-icon>
              </v-card-text>
            </v-card>
          </div>
        </v-tabs-window-item>

        <!-- BARCODE TAB -->
        <v-tabs-window-item value="barcode">
          <div class="text-center py-8">
            <v-icon size="80" color="primary" class="mb-4" style="opacity: 0.7;">mdi-barcode-scan</v-icon>
            <h4 class="text-subtitle-1 font-weight-bold mb-2">Manual Barcode Lookup</h4>
            <p class="text-body-2 text-medium-emphasis mb-6">
              Enter a product barcode above to search directly in the database.
            </p>

            <!-- Quick tips -->
            <v-card color="surface" rounded="xl" elevation="0" class="text-left pa-4">
              <div class="d-flex align-start mb-3">
                <v-icon color="primary" size="20" class="mr-3 mt-1">mdi-information-outline</v-icon>
                <div>
                  <div class="text-caption font-weight-bold mb-1">Accepted formats</div>
                  <div class="text-caption text-medium-emphasis">EAN-8 (8 digits), EAN-13 (13 digits), UPC-A (12 digits)</div>
                </div>
              </div>
              <div class="d-flex align-start">
                <v-icon color="primary" size="20" class="mr-3 mt-1">mdi-lightbulb-outline</v-icon>
                <div>
                  <div class="text-caption font-weight-bold mb-1">Tip</div>
                  <div class="text-caption text-medium-emphasis">You can find the barcode number printed below the barcode stripes on any product.</div>
                </div>
              </div>
            </v-card>
          </div>
        </v-tabs-window-item>

      </v-tabs-window>
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { productsAPI } from '@/services/api'
import { useProductsStore } from '@/stores/products'
import { useRecentScans } from '@/composables/useRecentScans'

const router = useRouter()
const productsStore = useProductsStore()
const { recentScans, getRelativeTime } = useRecentScans()

const activeTab = ref('recent')
const searchQuery = ref('')
const loadingFavorites = ref(false)
const favoritesError = ref('')
const favorites = ref<any[]>([])
const barcodeLoading = ref(false)
const barcodeError = ref('')

// Load favorites from backend
async function loadFavorites() {
  loadingFavorites.value = true
  favoritesError.value = ''
  try {
    const data = await productsAPI.getFavorites()
    favorites.value = Array.isArray(data) ? data : []
  } catch (e: any) {
    favoritesError.value = e?.message || 'Failed to load favorites. Please try again.'
    favorites.value = []
  } finally {
    loadingFavorites.value = false
  }
}

// Reload favorites when switching to favorites tab
watch(activeTab, (newTab) => {
  if (newTab === 'favorites') {
    loadFavorites()
  }
  // Clear search and errors when switching tabs
  searchQuery.value = ''
  barcodeError.value = ''
})

onMounted(() => {
  // Pre-load favorites in background
  loadFavorites()
})

// Barcode manual lookup
async function lookupBarcode() {
  const barcode = searchQuery.value.trim()
  if (!barcode) return

  // Basic barcode validation: 8–14 digits
  if (!/^\d{8,14}$/.test(barcode)) {
    barcodeError.value = `"${barcode}" is not a valid barcode. Barcodes must be 8–14 digits.`
    return
  }

  barcodeLoading.value = true
  barcodeError.value = ''

  try {
    const product = await productsStore.fetchProductByBarcode(barcode)
    if (product) {
      router.push(`/product/${barcode}`)
    } else {
      barcodeError.value = `No product found for barcode "${barcode}".`
    }
  } catch (e: any) {
    // Handle "Api error" or network errors
    const msg = e?.message || ''
    if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('api error')) {
      barcodeError.value = `No product found for barcode "${barcode}". The product may not be in the database.`
    } else {
      barcodeError.value = `Something went wrong while looking up "${barcode}". Please check your connection.`
    }
  } finally {
    barcodeLoading.value = false
  }
}

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
.explorer-wrapper {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

.explorer-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-section {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(var(--v-theme-background));
  padding-bottom: 4px;
}

.product-item {
  background: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  cursor: pointer;
  transition: opacity 0.2s;
}
.product-item:hover { opacity: 0.85; }
</style>