import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { productsAPI } from '@/services/api'

// LocalStorage Keys
const PRODUCTS_CACHE_KEY = 'nutriscan_products_cache'
const CACHE_VERSION = 'v1'

interface Product {
    barcode: string
    name: string
    brand: string
    imageUrl: string | null
    imageIngredientsUrl: string | null
    imageNutritionUrl: string | null
    categories: string | null
    ingredients: string | null
    allergens: string | null
    nutriscore: {
        grade: string
        score: number
    }
    serving: {
        size: string
        quantity: number
        unitBasis: string
    }
    nutriments: {
        energyKj100g: number
        energyKcal100g: number
        energyKcalServing: number
        proteins100g: number
        carbs100g: number
        fat100g: number
        saturatedFat100g: number
        sugars100g: number
        fiber100g: number
        salt100g: number
        sodium100g: number
    }
}

interface CachedProduct extends Product {
    cachedAt: string
}

interface ProductCache {
    version: string
    products: Record<string, CachedProduct>
}

export const useProductsStore = defineStore('products', () => {
    const currentProduct = ref<Product | null>(null)
    const recentProducts = ref<Product[]>([])
    const favoriteProducts = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    // ============= LocalStorage Cache Functions =============

    const loadCache = (): ProductCache => {
        try {
            const cached = localStorage.getItem(PRODUCTS_CACHE_KEY)
            if (!cached) {
                return { version: CACHE_VERSION, products: {} }
            }
            const data = JSON.parse(cached) as ProductCache
            // Check version compatibility
            if (data.version !== CACHE_VERSION) {
                console.log('🔄 Cache version mismatch, clearing cache')
                return { version: CACHE_VERSION, products: {} }
            }
            return data
        } catch (err) {
            console.error('❌ Error loading cache:', err)
            return { version: CACHE_VERSION, products: {} }
        }
    }

    const saveCache = (cache: ProductCache) => {
        try {
            localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cache))
            console.log('💾 Cache saved successfully')
        } catch (err) {
            console.error('❌ Error saving cache:', err)
        }
    }

    const getCachedProduct = (barcode: string): Product | null => {
        const cache = loadCache()
        const cached = cache.products[barcode]
        if (!cached) return null

        console.log(`💾 Found cached product: ${barcode}`)
        return cached
    }

    const setCachedProduct = (product: Product) => {
        const cache = loadCache()
        cache.products[product.barcode] = {
            ...product,
            cachedAt: new Date().toISOString()
        }
        saveCache(cache)
        console.log(`💾 Cached product: ${product.barcode}`)
    }

    // ============= Product Fetching with Cache =============

    const fetchProductByBarcode = async (barcode: string): Promise<Product> => {
        console.log('🔍 Fetching product:', barcode)

        // Check cache first
        const cachedProduct = getCachedProduct(barcode)
        if (cachedProduct) {
            currentProduct.value = cachedProduct
            console.log('✅ Using cached product')
            return cachedProduct
        }

        // Not in cache, fetch from API
        loading.value = true
        error.value = null

        try {
            console.log('📡 Fetching from API:', barcode)
            const response = await productsAPI.getByBarcode(barcode)
            console.log('✅ Response received:', response)

            const product = response.product as Product
            console.log('📦 Product data:', product)

            // Save to cache
            setCachedProduct(product)

            // Update current product
            currentProduct.value = product
            console.log('✅ Product set in store:', currentProduct.value)

            // Add to recent products if not already there
            if (!recentProducts.value.find(p => p.barcode === product.barcode)) {
                recentProducts.value.unshift(product)
                // Keep only last 20
                if (recentProducts.value.length > 20) {
                    recentProducts.value = recentProducts.value.slice(0, 20)
                }
            }

            return product
        } catch (err: any) {
            console.error('❌ Error fetching product:', err)
            error.value = err.message || 'Failed to fetch product'
            throw err
        } finally {
            loading.value = false
        }
    }

    // ============= Recent Products (user_product table) =============

    const saveToHistory = async (barcode: string): Promise<void> => {
        try {
            console.log('💾 Saving to history:', barcode)
            await productsAPI.saveToHistory(barcode)
            console.log('✅ Saved to history')
        } catch (err: any) {
            console.error('❌ Error saving to history:', err)
            throw err
        }
    }

    const fetchRecentProducts = async (): Promise<void> => {
        try {
            console.log('📡 Fetching recent products')
            const products = await productsAPI.getRecentProducts()
            recentProducts.value = products
            console.log('✅ Recent products loaded:', products.length)
        } catch (err: any) {
            console.error('❌ Error fetching recent products:', err)
            throw err
        }
    }

    // ============= Favorites =============

    const addToFavorites = async (barcode: string): Promise<void> => {
        try {
            console.log('⭐ Adding to favorites:', barcode)
            await productsAPI.addToFavorites(barcode)

            // Add to local favorites list
            const product = currentProduct.value || getCachedProduct(barcode)
            if (product && !favoriteProducts.value.find(p => p.barcode === barcode)) {
                favoriteProducts.value.unshift(product)
            }

            console.log('✅ Added to favorites')
        } catch (err: any) {
            console.error('❌ Error adding to favorites:', err)
            throw err
        }
    }

    const removeFromFavorites = async (barcode: string): Promise<void> => {
        try {
            console.log('⭐ Removing from favorites:', barcode)
            await productsAPI.removeFromFavorites(barcode)

            // Remove from local favorites list
            favoriteProducts.value = favoriteProducts.value.filter(p => p.barcode !== barcode)

            console.log('✅ Removed from favorites')
        } catch (err: any) {
            console.error('❌ Error removing from favorites:', err)
            throw err
        }
    }

    const fetchFavorites = async (): Promise<void> => {
        try {
            console.log('📡 Fetching favorites')
            const products = await productsAPI.getFavorites()
            favoriteProducts.value = products
            console.log('✅ Favorites loaded:', products.length)
        } catch (err: any) {
            console.error('❌ Error fetching favorites:', err)
            throw err
        }
    }

    const isFavorite = computed(() => {
        return (barcode: string) => {
            return favoriteProducts.value.some(p => p.barcode === barcode)
        }
    })

    // ============= Clear Cache (for debugging) =============

    const clearCache = () => {
        localStorage.removeItem(PRODUCTS_CACHE_KEY)
        console.log('🗑️ Cache cleared')
    }

    return {
        // State
        currentProduct,
        recentProducts,
        favoriteProducts,
        loading,
        error,

        // Actions
        fetchProductByBarcode,
        saveToHistory,
        fetchRecentProducts,
        addToFavorites,
        removeFromFavorites,
        fetchFavorites,
        clearCache,

        // Computed
        isFavorite,
    }
})