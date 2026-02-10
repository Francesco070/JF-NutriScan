// frontend/src/composables/useApi.ts
import { ref, unref, type Ref } from 'vue'
import { useApiCall } from '@/services/api'
import type { UseFetchOptions } from '@vueuse/core'

export function useApi<T = any>(
    endpoint: string | Ref<string>,
    options: UseFetchOptions = {}
) {
    const isLoading = ref(false)
    const error = ref<string | null>(null)
    const data = ref<T | null>(null)

    const execute = async () => {
        isLoading.value = true
        error.value = null

        try {
            const url = unref(endpoint)
            const result = await useApiCall<T>(url, options).execute()

            if (result.error.value) {
                error.value = result.error.value.message || 'Ein Fehler ist aufgetreten'
                return null
            }

            data.value = result.data.value
            return result.data.value
        } catch (err: any) {
            error.value = err.message || 'Ein Fehler ist aufgetreten'
            return null
        } finally {
            isLoading.value = false
        }
    }

    return {
        data,
        isLoading,
        error,
        execute,
    }
}