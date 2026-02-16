import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {productsAPI} from '@/services/api'
import {useRecentScans} from '@/composables/useRecentScans'

const PRODUCTS_CACHE_KEY = 'nutriscan_products_cache'
const CACHE_VERSION = 'v1'

export interface Product {
    barcode: string
    name: string | null
    brand: string | null
    imageUrl: string | null
    imageIngredientsUrl: string | null
    imageNutritionUrl: string | null
    categories: string | null
    ingredients: string | null
    allergens: string | null
    nutriscore: {
        grade: string | null
        score: number | null
    } | null
    serving: {
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

interface CachedProduct extends Product {
    cachedAt: string
}

interface ProductCache {
    version: string
    products: Record<string, CachedProduct>
}

export const useProductsStore = defineStore('products', () => {
    const currentProduct = ref<Product | null>(null)
    const favoriteProducts = ref<Product[]>([])
    const loading = ref(false)
    const error = ref<string | null>(null)

    const { addRecentScan, recentScans } = useRecentScans()

    // ============= LocalStorage Cache Functions =============

    const loadCache = (): ProductCache => {
        try {
            const cached = localStorage.getItem(PRODUCTS_CACHE_KEY)
            if (!cached) return { version: CACHE_VERSION, products: {} }
            const data = JSON.parse(cached) as ProductCache
            if (data.version !== CACHE_VERSION) return { version: CACHE_VERSION, products: {} }
            return data
        } catch {
            return { version: CACHE_VERSION, products: {} }
        }
    }

    const saveCache = (cache: ProductCache) => {
        try {
            localStorage.setItem(PRODUCTS_CACHE_KEY, JSON.stringify(cache))
        } catch { /* ignore */ }
    }

    const getCachedProduct = (barcode: string): Product | null => {
        const cache = loadCache()
        return cache.products[barcode] ?? null
    }

    const setCachedProduct = (product: Product) => {
        const cache = loadCache()
        cache.products[product.barcode] = { ...product, cachedAt: new Date().toISOString() }
        saveCache(cache)
    }

    // ============= Product Fetching with Cache =============

    const fetchProductByBarcode = async (barcode: string): Promise<Product> => {
        const cachedProduct = getCachedProduct(barcode)
        if (cachedProduct) {
            currentProduct.value = cachedProduct
            // Still register as recent scan (updates timestamp)
            addRecentScan({
                barcode: cachedProduct.barcode,
                name: cachedProduct.name,
                brand: cachedProduct.brand,
                imageUrl: cachedProduct.imageUrl,
                nutriscore: cachedProduct.nutriscore,
                nutriments: cachedProduct.nutriments,
            })
            return cachedProduct
        }

        loading.value = true
        error.value = null

        try {
            const response = await productsAPI.getByBarcode(barcode)
            const product = response.product as Product

            setCachedProduct(product)
            currentProduct.value = product

            // Register as recent scan in localStorage
            addRecentScan({
                barcode: product.barcode,
                name: product.name,
                brand: product.brand,
                imageUrl: product.imageUrl,
                nutriscore: product.nutriscore,
                nutriments: product.nutriments,
            })

            return product
        } catch (err: any) {
            error.value = err.message || 'Failed to fetch product'
            throw err
        } finally {
            loading.value = false
        }
    }

    // ============= Favorites =============

    const addToFavorites = async (barcode: string): Promise<void> => {
        await productsAPI.addToFavorites(barcode)
        const product = currentProduct.value || getCachedProduct(barcode)
        if (product && !favoriteProducts.value.find(p => p.barcode === barcode)) {
            favoriteProducts.value.unshift(product)
        }
    }

    const removeFromFavorites = async (barcode: string): Promise<void> => {
        await productsAPI.removeFromFavorites(barcode)
        favoriteProducts.value = favoriteProducts.value.filter(p => p.barcode !== barcode)
    }

    const fetchFavorites = async (): Promise<void> => {
        favoriteProducts.value = await productsAPI.getFavorites()
    }

    const checkFavorite = async (barcode: string): Promise<boolean> => {
        try {
            const result = await productsAPI.checkFavorite(barcode)
            return result.isFavorite
        } catch {
            return false
        }
    }

    const isFavorite = computed(() => {
        return (barcode: string) => favoriteProducts.value.some(p => p.barcode === barcode)
    })

    // ============= History =============

    const addToHistory = async (barcode: string): Promise<void> => {
        await productsAPI.addToHistory(barcode)
    }

    const fetchHistory = async (): Promise<void> => {
        const products = await productsAPI.getHistory()
        // Sync server history into local recent scans
        for (const p of products) {
            addRecentScan({
                barcode: p.barcode,
                name: p.name,
                brand: p.brand,
                imageUrl: p.imageUrl,
                nutriscore: p.nutriscore,
                nutriments: p.nutriments,
            })
        }
    }

    const clearCache = () => {
        localStorage.removeItem(PRODUCTS_CACHE_KEY)
    }

    return {
        currentProduct,
        recentProducts: recentScans, // expose recentScans as recentProducts for backwards compat
        favoriteProducts,
        loading,
        error,
        fetchProductByBarcode,
        addToFavorites,
        removeFromFavorites,
        fetchFavorites,
        checkFavorite,
        addToHistory,
        fetchHistory,
        clearCache,
        isFavorite,
    }
})