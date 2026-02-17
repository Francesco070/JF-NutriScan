import { ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

export function useScanner() {
    const isScanning = ref(false)
    const scannedCode = ref<string | null>(null)
    const error = ref<string | null>(null)
    const noProductFound = ref(false)
    let scanner: Html5Qrcode | null = null

    const startScan = async (elementId: string) => {
        try {
            isScanning.value = true
            error.value = null
            noProductFound.value = false

            scanner = new Html5Qrcode(elementId)

            await scanner.start(
                { facingMode: "environment" }, // Rückkamera
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    scannedCode.value = decodedText
                    noProductFound.value = false
                    stopScan()
                },
                () => {
                    // Scan errors sind normal während dem Scannen
                    // Nur loggen wenn länger als 5 Sekunden kein Code gefunden wurde
                }
            )
        } catch (err: any) {
            error.value = err.message || 'Failed to start scanner'
            isScanning.value = false
        }
    }

    const scanFile = async (file: File): Promise<string | null> => {
        try {
            if (!scanner) {
                scanner = new Html5Qrcode('qr-reader')
            }

            const result = await scanner.scanFile(file, true)

            if (result) {
                scannedCode.value = result
                noProductFound.value = false
                return result
            } else {
                noProductFound.value = true
                return null
            }
        } catch (err: any) {
            noProductFound.value = true
            error.value = 'No product found'
            return null
        }
    }

    const stopScan = async () => {
        if (scanner) {
            try {
                await scanner.stop()
                scanner.clear()
            } catch (err) {
                console.error('Error stopping scanner:', err)
            }
            scanner = null
            isScanning.value = false
        }
    }

    return {
        isScanning,
        scannedCode,
        error,
        noProductFound,
        startScan,
        scanFile,
        stopScan,
    }
}