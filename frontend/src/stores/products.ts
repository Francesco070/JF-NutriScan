// frontend/src/stores/products.ts
// FINALE VERSION - Funktioniert mit native fetch API

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { productsAPI } from '@/services/api'

interface Product {
    barcode: string
    name: string | null
    brand: string | null
    imageUrl: string | null
    imageIngredientsUrl?: string | null
    imageNutritionUrl?: string | null
    categories?: string | null
    ingredients?: string | null
    allergens?: string | null
    nutriscore?: {
        grade: string | null
        score: number | null
    } | null
    serving?: {
        size: string | null
        quantity: number | null
        unitBasis: string | null
    } | null
    nutriments: {
        energyKj100g: number | null
        energyKcal100g: number | null
        energyKcalServing: number | null
        proteins100g: number | null
        carbs100g: number | null
        fat100g: number | null
        saturatedFat100g: number | null
        sugars100g: number | null
        fiber100g: number | null
        salt100g: number | null
        sodium100g: number | null
    }
}

export const useProductsStore = defineStore('products', () => {
    const currentProduct = ref<Product | null>(null)
    const recentProducts = ref<Product[]>([])
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    const fetchProductByBarcode = async (barcode: string) => {
        isLoading.value = true
        error.value = null

        try {
            console.log('🔍 Fetching product:', barcode)

            // Direkter API call - productsAPI.getByBarcode ist jetzt async und gibt Promise zurück
            const response = await productsAPI.getByBarcode(barcode)

            console.log('✅ Response received:', response)
            console.log('📦 Product data:', response.product)

            if (!response.product) {
                error.value = 'Ungültige Serverantwort (kein product Feld)'
                console.error('❌ No product in response')
                return null
            }

            currentProduct.value = response.product
            console.log('✅ Product set in store:', currentProduct.value)

            // Zu recent products hinzufügen
            const existingIndex = recentProducts.value.findIndex(p => p.barcode === barcode)
            if (existingIndex > -1) {
                recentProducts.value.splice(existingIndex, 1)
            }
            recentProducts.value.unshift(response.product)

            // Maximal 20 recent products
            if (recentProducts.value.length > 20) {
                recentProducts.value = recentProducts.value.slice(0, 20)
            }

            return response.product
        } catch (err: any) {
            console.error('❌ Error fetching product:', err)
            error.value = err.message || 'Produkt konnte nicht geladen werden'
            return null
        } finally {
            isLoading.value = false
        }
    }

    return {
        currentProduct,
        recentProducts,
        isLoading,
        error,
        fetchProductByBarcode,
    }
})