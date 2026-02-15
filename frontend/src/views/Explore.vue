<template>
  <div class="explore-wrapper">
    <v-container class="explore-container pa-4">
      <!-- Main Explore View -->
      <div v-if="!$route.params.barcode">
        <h1 class="text-h4 font-weight-bold mb-4">Explore</h1>

        <!-- Search Bar -->
        <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            label="Search products..."
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
            class="mb-4"
            @input="filterProducts"
        />

        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="text-body-2 text-medium-emphasis mt-4">Lade Produkte...</p>
        </div>

        <!-- Recent Scans -->
        <template v-else>
          <div class="d-flex justify-space-between align-center mb-3">
            <h3 class="text-h6 font-weight-bold">
              {{ filteredProducts.length > 0 ? 'Gefundene Produkte' : 'Gescannte Produkte' }}
            </h3>
            <v-chip v-if="searchQuery" size="small" color="primary">
              {{ filteredProducts.length }} Ergebnisse
            </v-chip>
          </div>

          <!-- No Products State -->
          <v-card v-if="recentProducts.length === 0" color="surface" rounded="lg" class="mb-4">
            <v-card-text class="text-center pa-8">
              <v-icon size="80" color="grey">mdi-barcode-scan</v-icon>
              <h3 class="text-h6 font-weight-bold mt-4 mb-2">Noch keine Produkte gescannt</h3>
              <p class="text-body-2 text-medium-emphasis mb-4">
                Scanne dein erstes Produkt um loszulegen!
              </p>
              <v-btn color="primary" size="large" @click="router.push('/scanner')">
                <v-icon left>mdi-camera</v-icon>
                Jetzt scannen
              </v-btn>
            </v-card-text>
          </v-card>

          <!-- No Search Results -->
          <v-card v-else-if="searchQuery && filteredProducts.length === 0" color="surface" rounded="lg" class="mb-4">
            <v-card-text class="text-center pa-6">
              <v-icon size="64" color="grey">mdi-magnify-close</v-icon>
              <h3 class="text-h6 font-weight-bold mt-4 mb-2">Keine Ergebnisse gefunden</h3>
              <p class="text-body-2 text-medium-emphasis">
                Versuche einen anderen Suchbegriff
              </p>
            </v-card-text>
          </v-card>

          <!-- Products Grid -->
          <v-row v-else>
            <v-col
                v-for="product in filteredProducts"
                :key="product.barcode"
                cols="12"
                sm="6"
                md="4"
            >
              <v-card
                  class="product-card"
                  color="surface"
                  rounded="lg"
                  @click="viewProduct(product.barcode)"
              >
                <!-- Product Image -->
                <v-img
                    v-if="product.imageUrl"
                    :src="product.imageUrl"
                    height="180"
                    cover
                    class="product-image"
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="grey"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
                <div v-else class="product-image-placeholder">
                  <v-icon size="80" color="grey-darken-1">mdi-image-off-outline</v-icon>
                </div>

                <!-- Product Info -->
                <v-card-text class="pa-3">
                  <!-- Nutri-Score Badge -->
                  <div class="d-flex justify-space-between align-center mb-2">
                    <v-chip
                        v-if="product.nutriscore?.grade"
                        :color="getNutriscoreColor(product.nutriscore.grade)"
                        size="small"
                    >
                      {{ product.nutriscore.grade.toUpperCase() }}
                    </v-chip>
                    <v-chip v-else size="small" variant="outlined">
                      N/A
                    </v-chip>
                  </div>

                  <!-- Product Name -->
                  <h4 class="text-subtitle-2 font-weight-bold mb-1 text-truncate">
                    {{ product.name || 'Unbekanntes Produkt' }}
                  </h4>

                  <!-- Brand & Calories -->
                  <p class="text-caption text-medium-emphasis mb-2">
                    {{ product.brand || 'Keine Marke' }}
                  </p>

                  <!-- Nutrition Info -->
                  <div class="d-flex align-center text-caption">
                    <v-icon size="14" class="mr-1">mdi-fire</v-icon>
                    <span>{{ product.nutriments.energyKcal100g || '?' }} kcal</span>
                    <v-spacer></v-spacer>
                    <span class="text-medium-emphasis">per 100g</span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Categories Section (Optional) -->
          <div v-if="!searchQuery && recentProducts.length > 0" class="mt-6">
            <h3 class="text-h6 font-weight-bold mb-3">Filter by Category</h3>
            <v-row>
              <v-col v-for="category in topCategories" :key="category.name" cols="6" sm="4">
                <v-card
                    color="surface"
                    rounded="lg"
                    class="category-card"
                    @click="searchByCategory(category.name)"
                >
                  <v-card-text class="text-center pa-4">
                    <v-avatar :color="category.color" size="48" class="mb-2">
                      <v-icon size="28">{{ category.icon }}</v-icon>
                    </v-avatar>
                    <h4 class="text-subtitle-2 font-weight-bold">
                      {{ category.name }}
                    </h4>
                    <p class="text-caption text-medium-emphasis">
                      {{ category.count }} items
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </template>
      </div>

      <!-- Product Detail (Sub-route) -->
      <router-view v-else />
    </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'

const router = useRouter()
const productsStore = useProductsStore()

const searchQuery = ref('')
const isLoading = ref(false)

// Get recent products from store
const recentProducts = computed(() => productsStore.recentProducts || [])

// Filtered products based on search
const filteredProducts = computed(() => {
  if (!searchQuery.value) return recentProducts.value

  const query = searchQuery.value.toLowerCase()
  return recentProducts.value.filter(product => {
    const name = product.name?.toLowerCase() || ''
    const brand = product.brand?.toLowerCase() || ''
    const barcode = product.barcode?.toLowerCase() || ''
    const categories = product.categories?.toLowerCase() || ''

    return name.includes(query) ||
        brand.includes(query) ||
        barcode.includes(query) ||
        categories.includes(query)
  })
})

// Extract top categories from scanned products
const topCategories = computed(() => {
  const categoryCount = new Map<string, number>()

  recentProducts.value.forEach(product => {
    if (product.categories) {
      const cats = product.categories.split(',').map(c => c.trim())
      cats.forEach(cat => {
        if (cat) {
          categoryCount.set(cat, (categoryCount.get(cat) || 0) + 1)
        }
      })
    }
  })

  // Convert to array and sort by count
  const sortedCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6) // Top 6 categories

  // Map to category objects with icons
  return sortedCategories.map(([name, count]) => ({
    name,
    count,
    color: getCategoryColor(name),
    icon: getCategoryIcon(name)
  }))
})

const viewProduct = (barcode: string) => {
  router.push(`/product/${barcode}`)
}

const filterProducts = () => {
  // Trigger reactivity
}

const searchByCategory = (category: string) => {
  searchQuery.value = category
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

const getCategoryColor = (category: string): string => {
  const cat = category.toLowerCase()
  if (cat.includes('dairy') || cat.includes('milk')) return 'success'
  if (cat.includes('beverage') || cat.includes('drink')) return 'primary'
  if (cat.includes('snack')) return 'warning'
  if (cat.includes('frozen')) return 'info'
  if (cat.includes('bakery') || cat.includes('bread')) return 'orange'
  return 'grey'
}

const getCategoryIcon = (category: string): string => {
  const cat = category.toLowerCase()
  if (cat.includes('dairy') || cat.includes('milk')) return 'mdi-cow'
  if (cat.includes('beverage') || cat.includes('drink')) return 'mdi-cup'
  if (cat.includes('snack')) return 'mdi-food-apple'
  if (cat.includes('frozen')) return 'mdi-snowflake'
  if (cat.includes('bakery') || cat.includes('bread')) return 'mdi-bread-slice'
  if (cat.includes('meat')) return 'mdi-food-steak'
  if (cat.includes('vegetable')) return 'mdi-carrot'
  if (cat.includes('fruit')) return 'mdi-food-apple'
  return 'mdi-tag'
}
</script>

<style scoped>
/* Scroll wrapper */
.explore-wrapper {
  height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 80px;
}

.explore-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Product Card */
.product-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.product-image {
  border-radius: 12px 12px 0 0;
}

.product-image-placeholder {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 12px 12px 0 0;
}

/* Category Card */
.category-card {
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.category-card:hover {
  transform: scale(1.05);
}

/* Text truncation */
.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>