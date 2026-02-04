<template>
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
      ></v-text-field>

      <!-- Categories -->
      <h3 class="text-h6 font-weight-bold mb-3">Categories</h3>
      <v-row class="mb-4">
        <v-col v-for="category in categories" :key="category.name" cols="6">
          <v-card color="surface" rounded="lg" @click="selectCategory(category.name)">
            <v-card-text class="text-center pa-4">
              <v-avatar :color="category.color" size="56" class="mb-2">
                <v-icon size="32">{{ category.icon }}</v-icon>
              </v-avatar>
              <h4 class="text-subtitle-2 font-weight-bold">{{ category.name }}</h4>
              <p class="text-caption text-medium-emphasis">{{ category.count }} items</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <!-- Product Detail (Sub-route) -->
    <router-view v-else />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const searchQuery = ref('')

const categories = [
  { name: 'Dairy', count: 156, color: 'success', icon: 'mdi-cow' },
  { name: 'Beverages', count: 234, color: 'primary', icon: 'mdi-cup' },
  { name: 'Snacks', count: 189, color: 'warning', icon: 'mdi-food-apple' },
  { name: 'Frozen', count: 98, color: 'info', icon: 'mdi-snowflake' },
]

const selectCategory = (name: string) => {
  console.log('Selected:', name)
}
</script>

<style scoped>
.explore-container {
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 80px;
}
</style>