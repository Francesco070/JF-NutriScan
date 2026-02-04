import { ref } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

export function useScanner() {
    const isScanning = ref(false)
    const scannedCode = ref<string | null>(null)
    const error = ref<string | null>(null)
    let scanner: Html5Qrcode | null = null

    const startScan = async (elementId: string) => {
        try {
            isScanning.value = true
            error.value = null

            scanner = new Html5Qrcode(elementId)

            await scanner.start(
                { facingMode: "environment" }, // Rückkamera
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    console.log('Barcode detected:', decodedText)
                    scannedCode.value = decodedText
                    stopScan()
                },
                () => {
                    // Scan errors are normal, ignore them
                    // console.log('Scan error:', errorMessage)
                }
            )
        } catch (err: any) {
            console.error('Scanner start failed:', err)
            error.value = err.message || 'Failed to start scanner'
            isScanning.value = false
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
        startScan,
        stopScan,
    }
}