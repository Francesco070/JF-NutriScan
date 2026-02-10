<template>
  <v-container class="product-detail">
    <!-- Loading State -->
    <v-row v-if="isLoading" justify="center" class="mt-8">
      <v-col cols="12" class="text-center">
        <v-progress-circular
            indeterminate
            color="primary"
            size="64"
        />
        <p class="mt-4 text-h6">Produkt wird geladen...</p>
      </v-col>
    </v-row>

    <!-- Error State -->
    <v-row v-else-if="error" justify="center" class="mt-8">
      <v-col cols="12" md="6">
        <v-alert type="error" prominent>
          <v-row align="center">
            <v-col cols="auto">
              <v-icon size="48">mdi-alert-circle</v-icon>
            </v-col>
            <v-col>
              <div class="text-h6">{{ error }}</div>
              <div class="text-body-2 mt-2">
                Barcode: {{ route.params.barcode }}
              </div>
            </v-col>
          </v-row>
          <v-btn
              color="white"
              variant="outlined"
              class="mt-4"
              @click="router.push('/scanner')"
          >
            <v-icon left>mdi-barcode-scan</v-icon>
            Erneut scannen
          </v-btn>
        </v-alert>
      </v-col>
    </v-row>

    <!-- Product Content -->
    <div v-else-if="product">
      <!-- Header mit Bild -->
      <v-row>
        <v-col cols="12">
          <v-card color="background" elevation="0">
            <v-row no-gutters>
              <!-- Produkt Bild -->
              <v-col cols="12" md="4" class="d-flex align-center justify-center pa-4">
                <v-img
                    :src="product.imageUrl || 'https://via.placeholder.com/300x300?text=Kein+Bild'"
                    :alt="product.name || 'Produkt'"
                    max-width="300"
                    max-height="300"
                    contain
                    rounded="xl"
                />
              </v-col>

              <!-- Produkt Info -->
              <v-col cols="12" md="8">
                <v-card-text>
                  <!-- Nutri-Score Badge -->
                  <v-chip
                      v-if="product.nutriscore?.grade"
                      :color="getNutriscoreColor(product.nutriscore.grade)"
                      size="large"
                      class="mb-3"
                  >
                    <v-icon left>mdi-nutrition</v-icon>
                    Nutri-Score: {{ product.nutriscore.grade.toUpperCase() }}
                  </v-chip>

                  <!-- Produktname -->
                  <h1 class="text-h4 mb-2">
                    {{ product.name || 'Unbekanntes Produkt' }}
                  </h1>

                  <!-- Marke -->
                  <p v-if="product.brand" class="text-h6 text-grey-darken-1 mb-3">
                    {{ product.brand }}
                  </p>

                  <!-- Barcode -->
                  <v-chip variant="outlined" class="mb-3">
                    <v-icon left size="small">mdi-barcode</v-icon>
                    {{ product.barcode }}
                  </v-chip>

                  <!-- Kategorien -->
                  <div v-if="product.categories" class="mb-3">
                    <v-chip
                        v-for="(category, index) in getCategoriesArray(product.categories)"
                        :key="index"
                        size="small"
                        class="mr-2 mb-2"
                        variant="tonal"
                    >
                      {{ category }}
                    </v-chip>
                  </div>

                  <!-- Portionsgröße -->
                  <div v-if="product.serving?.size" class="text-body-1 mb-2">
                    <v-icon left color="primary">mdi-food-fork-drink</v-icon>
                    Portionsgröße: <strong>{{ product.serving.size }}</strong>
                  </div>
                </v-card-text>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Nährwerte -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card color="background" elevation="0">
            <v-card-title>
              <v-icon left>mdi-nutrition</v-icon>
              Nährwerte pro {{ product.serving?.unitBasis }}
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="6" md="3">
                  <div class="nutrient-card">
                    <v-icon color="orange" size="32">mdi-fire</v-icon>
                    <div class="text-h6 mt-2">{{ product.nutriments.energyKcal100g || 'N/A' }}</div>
                    <div class="text-caption text-grey">kcal</div>
                  </div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="nutrient-card">
                    <v-icon color="blue" size="32">mdi-hamburger</v-icon>
                    <div class="text-h6 mt-2">{{ product.nutriments.proteins100g || 'N/A' }}</div>
                    <div class="text-caption text-grey">g Eiweiß</div>
                  </div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="nutrient-card">
                    <v-icon color="green" size="32">mdi-barley</v-icon>
                    <div class="text-h6 mt-2">{{ product.nutriments.carbs100g || 'N/A' }}</div>
                    <div class="text-caption text-grey">g Kohlenhydrate</div>
                  </div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="nutrient-card">
                    <v-icon color="yellow-darken-2" size="32">mdi-oil</v-icon>
                    <div class="text-h6 mt-2">{{ product.nutriments.fat100g || 'N/A' }}</div>
                    <div class="text-caption text-grey">g Fett</div>
                  </div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="nutrient-card">
                    <v-icon color="pink-lighten-2" size="32">mdi-spoon-sugar</v-icon>
                    <div class="text-h6 mt-2">{{ product.nutriments.sugars100g || 'N/A' }}</div>
                    <div class="text-caption text-grey">g Zucker</div>
                  </div>
                </v-col>
                <v-col cols="6" md="3">
                  <div class="nutrient-card">
                    <v-icon color="grey-lighten-1" size="32">mdi-shaker-outline</v-icon>
                    <div class="text-h6 mt-2">{{ product.nutriments.salt100g || 'N/A' }}</div>
                    <div class="text-caption text-grey">g Salz</div>
                  </div>
                </v-col>
              </v-row>

              <!-- Weitere Nährwerte -->
              <v-divider class="my-4" />

              <v-row dense>
                <v-col cols="6" md="4" v-if="product.nutriments.fiber100g">
                  <div class="text-caption text-grey">Ballaststoffe</div>
                  <div class="text-body-1">{{ product.nutriments.fiber100g }} g</div>
                </v-col>
                <v-col cols="6" md="4" v-if="product.nutriments.saturatedFat100g">
                  <div class="text-caption text-grey">Gesättigte Fettsäuren</div>
                  <div class="text-body-1">{{ product.nutriments.saturatedFat100g }} g</div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Zutaten (COLLAPSIBLE) -->
      <v-row v-if="product.ingredients" class="mt-4">
        <v-col cols="12">
          <v-card color="background" elevation="0">
            <v-card-title
                class="d-flex align-center"
                style="cursor: pointer;"
                @click="ingredientsExpanded = !ingredientsExpanded"
            >
              <v-icon start>mdi-format-list-bulleted</v-icon>
              Zutaten

              <v-spacer></v-spacer>

              <v-icon>
                {{ ingredientsExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-card-title>

            <v-expand-transition>
              <v-card-text v-show="ingredientsExpanded">
                <p class="text-body-1">{{ product.ingredients }}</p>
              </v-card-text>
            </v-expand-transition>
          </v-card>
        </v-col>
      </v-row>

      <!-- Allergene -->
      <v-row v-if="product.allergens" class="mt-4">
        <v-col cols="12">
          <v-card color="background" elevation="0">
            <v-card-title>
              <v-icon left>mdi-alert</v-icon>
              Allergene
            </v-card-title>
            <v-card-text>
              <v-chip
                  v-for="(allergen, index) in getAllergensArray(product.allergens)"
                  :key="index"
                  color="warning"
                  class="mr-2 mb-2"
              >
                {{ allergen }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Weitere Bilder (CLICKABLE FOR FULLSCREEN) -->
      <v-row v-if="product.imageIngredientsUrl || product.imageNutritionUrl" class="mt-4">
        <v-col cols="12" md="6" v-if="product.imageIngredientsUrl">
          <v-card color="background" elevation="0">
            <v-card-title>
              <v-icon left>mdi-image</v-icon>
              Zutatenliste
            </v-card-title>
            <v-img
                :src="product.imageIngredientsUrl"
                alt="Zutatenliste"
                aspect-ratio="1"
                cover
                style="cursor: pointer;"
                @click="openImageDialog(product.imageIngredientsUrl, 'Zutatenliste')"
            />
          </v-card>
        </v-col>
        <v-col cols="12" md="6" v-if="product.imageNutritionUrl">
          <v-card color="background" elevation="0">
            <v-card-title>
              <v-icon left>mdi-image</v-icon>
              Nährwerttabelle
            </v-card-title>
            <v-img
                :src="product.imageNutritionUrl"
                alt="Nährwerttabelle"
                aspect-ratio="1"
                cover
                style="cursor: pointer;"
                @click="openImageDialog(product.imageNutritionUrl, 'Nährwerttabelle')"
            />
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Image Dialog (Fullscreen) -->
    <v-dialog v-model="imageDialog" fullscreen>
      <v-card rounded="0">
        <v-toolbar color="background" elevation="0">
          <v-toolbar-title>{{ dialogImageTitle }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="imageDialog = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-card-text class="pa-0" style="height: calc(100vh - 64px); display: flex; align-items: center; justify-content: center; background: #000;">
          <v-img
              :src="dialogImageUrl"
              :alt="dialogImageTitle"
              contain
              max-height="calc(100vh - 64px)"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height ma-0" align="center" justify="center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
          </v-img>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductsStore } from '@/stores/products'

const route = useRoute()
const router = useRouter()
const productsStore = useProductsStore()

const isLoading = ref(false)
const error = ref<string | null>(null)
const ingredientsExpanded = ref(false)
const imageDialog = ref(false)
const dialogImageUrl = ref('')
const dialogImageTitle = ref('')

// Produkt aus dem Store
const product = computed(() => productsStore.currentProduct)

// Nutri-Score Farbe
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

// Kategorien als Array
const getCategoriesArray = (categories: string): string[] => {
  return categories.split(',').map(cat => cat.trim()).filter(Boolean)
}

// Allergene als Array
const getAllergensArray = (allergens: string): string[] => {
  return allergens.split(',').map(allergen => allergen.trim()).filter(Boolean)
}

// Bild Dialog öffnen
const openImageDialog = (imageUrl: string, title: string) => {
  dialogImageUrl.value = imageUrl
  dialogImageTitle.value = title
  imageDialog.value = true
}

// Produkt laden wenn nicht im Store
const loadProduct = async () => {
  const barcode = route.params.barcode as string

  // Prüfen ob Produkt bereits im Store ist
  if (product.value && product.value.barcode === barcode) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const loadedProduct = await productsStore.fetchProductByBarcode(barcode)

    if (!loadedProduct) {
      error.value = productsStore.error || 'Produkt konnte nicht geladen werden'
    }
  } catch (err: any) {
    error.value = 'Fehler beim Laden des Produkts'
    console.error('Product load error:', err)
  } finally {
    isLoading.value = false
  }
}

// Watch route parameter changes
watch(
    () => route.params.barcode,
    () => {
      loadProduct()
      ingredientsExpanded.value = false // Reset beim Produktwechsel
    }
)

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.nutrient-card {
  text-align: center;
  padding: 16px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.nutrient-card:hover {
  background: rgba(0, 0, 0, 0.05);
  transition: background 0.3s;
}
</style>