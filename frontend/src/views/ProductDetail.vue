<template>
  <v-container>
    <h1>Product Detail</h1>
    <p>Barcode: {{ barcode }}</p>
  </v-container>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'

defineProps<{
  barcode: string
}>()
</script>