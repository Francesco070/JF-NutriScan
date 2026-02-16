import { ref } from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const STORAGE_KEY = 'nutriscan_recent_scans'
const MAX_RECENT = 20

export interface RecentScan {
    barcode: string
    name: string | null
    brand: string | null
    imageUrl: string | null
    nutriscore: {
        grade: string | null
        score: number | null
    } | null
    nutriments: {
        energyKcal100g: number | null
        proteins100g: number | null
        carbs100g: number | null
        fat100g: number | null
        [key: string]: number | null
    }
    scannedAt: string // ISO string
}

// Shared reactive state across all composable instances
const recentScans = ref<RecentScan[]>(loadFromStorage())

function loadFromStorage(): RecentScan[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        return JSON.parse(raw) as RecentScan[]
    } catch {
        return []
    }
}

function saveToStorage(scans: RecentScan[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(scans))
    } catch {
        // Storage full or unavailable
    }
}

export function useRecentScans() {
    const addRecentScan = (product: Omit<RecentScan, 'scannedAt'>) => {
        const existing = recentScans.value.findIndex(s => s.barcode === product.barcode)

        const entry: RecentScan = {
            ...product,
            scannedAt: new Date().toISOString(),
        }

        if (existing !== -1) {
            // Move to top with updated timestamp
            recentScans.value.splice(existing, 1)
        }

        recentScans.value.unshift(entry)

        // Keep only MAX_RECENT items
        if (recentScans.value.length > MAX_RECENT) {
            recentScans.value = recentScans.value.slice(0, MAX_RECENT)
        }

        saveToStorage(recentScans.value)
    }

    const getRelativeTime = (isoString: string): string => {
        return dayjs(isoString).fromNow()
    }

    const clearRecentScans = () => {
        recentScans.value = []
        localStorage.removeItem(STORAGE_KEY)
    }

    return {
        recentScans,
        addRecentScan,
        getRelativeTime,
        clearRecentScans,
    }
}