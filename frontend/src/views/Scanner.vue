<template>
  <v-container class="scanner-container pa-0" fluid>
    <!-- Floating Gradient Header -->
    <div class="scanner-header-gradient">
      <div class="header-content">
        <v-btn
            icon
            variant="text"
            @click="toggleFlash"
            :color="flashOn ? 'warning' : 'white'"
        >
          <v-icon>{{ flashOn ? 'mdi-flash' : 'mdi-flash-off' }}</v-icon>
        </v-btn>

        <h3 class="text-h6 font-weight-bold" style="color: white">NutriScan</h3>

        <v-btn
            icon
            variant="text"
            @click="switchCamera"
            color="white"
        >
          <v-icon>mdi-camera-flip</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Scanner Area -->
    <div class="scanner-view">
      <!-- Video Element für Kamera (Live View) -->
      <video
          v-show="!isFrozen"
          id="scanner-video"
          ref="videoElement"
          class="scanner-video"
          autoplay
          playsinline
      ></video>

      <!-- Hidden QR Reader Element -->
      <div id="qr-reader" style="display: none;"></div>

      <!-- Canvas für Frozen Frame -->
      <canvas
          v-show="isFrozen"
          ref="canvasElement"
          class="scanner-video"
      ></canvas>

      <!-- Scan Frame with Thick Corners -->
      <div class="scan-frame">
        <div class="frame-corner top-left"></div>
        <div class="frame-corner top-right"></div>
        <div class="frame-corner bottom-left"></div>
        <div class="frame-corner bottom-right"></div>
        <!-- Animated Scanner Line -->
        <div class="scanner-line" :class="{ active: isScanning && !isFrozen }"></div>
      </div>

      <!-- Product Found Preview (below scan frame) -->
      <transition name="slide-up">
        <v-card
            v-if="scannedProduct"
            class="product-preview"
            rounded="xl"
            @click="openProduct"
        >
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar size="60" rounded="lg" class="mr-3">
              <v-img :src="scannedProduct.image"></v-img>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="d-flex align-center mb-1">
                <v-chip
                    :color="getNutriScoreColor(scannedProduct.nutriscore)"
                    size="small"
                    class="mr-2"
                >
                  {{ scannedProduct.nutriscore }}
                </v-chip>
                <v-icon color="success" size="20">mdi-check-circle</v-icon>
              </div>
              <h4 class="text-subtitle-1 font-weight-bold white--text">{{ scannedProduct.name }}</h4>
              <p class="text-caption text-medium-emphasis mb-0">{{ scannedProduct.brand }}</p>
            </div>
            <v-icon color="white">mdi-chevron-right</v-icon>
          </v-card-text>
        </v-card>
      </transition>

      <!-- No Product Found Message -->
      <transition name="slide-up">
        <v-card
            v-if="noProductFound && !scannedProduct"
            class="product-preview error-preview"
            rounded="xl"
        >
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar size="60" rounded="lg" color="error" class="mr-3">
              <v-icon color="white" size="32">mdi-alert-circle-outline</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-bold white--text mb-1">No Product Found</h4>
              <p class="text-caption text-medium-emphasis mb-0">
                Kein Barcode oder QR-Code erkannt. Bitte erneut versuchen.
              </p>
            </div>
            <v-btn
                icon
                size="small"
                variant="text"
                @click="noProductFound = false"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </transition>

      <!-- Analyzing Overlay -->
      <transition name="fade">
        <div v-if="isAnalyzing" class="analyzing-overlay">
          <v-card color="rgba(0, 0, 0, 0.9)" rounded="xl" class="analyzing-card">
            <v-card-text class="text-center pa-6">
              <v-progress-circular
                  indeterminate
                  color="primary"
                  size="64"
                  class="mb-4"
              ></v-progress-circular>
              <h3 class="text-h6 font-weight-bold mb-2">Analyzing Image...</h3>
              <p class="text-body-2 text-medium-emphasis">
                Searching for barcode or QR code
              </p>
            </v-card-text>
          </v-card>
        </div>
      </transition>
    </div>

    <!-- Bottom Controls -->
    <div class="scanner-controls">
      <!-- Upload Photo -->
      <v-btn
          icon
          size="large"
          variant="elevated"
          color="surface"
          elevation="4"
          @click="uploadPhoto"
          :disabled="isFrozen"
      >
        <v-icon>mdi-image-plus</v-icon>
      </v-btn>

      <!-- Capture Button (Main) - Changes to Back when frozen -->
      <v-btn
          icon
          size="72"
          :color="isFrozen ? 'error' : 'primary'"
          elevation="12"
          class="capture-btn"
          @click="isFrozen ? unfreeze() : captureBarcode()"
      >
        <v-icon size="40">{{ isFrozen ? 'mdi-arrow-left' : 'mdi-camera' }}</v-icon>
      </v-btn>

      <!-- History -->
      <v-btn
          icon
          size="large"
          variant="elevated"
          color="surface"
          elevation="4"
          @click="toggleHistory"
          :disabled="isFrozen"
      >
        <v-icon>mdi-history</v-icon>
      </v-btn>
    </div>

    <!-- History Drawer - Centered with margin -->
    <transition name="slide-up">
      <div v-if="showHistory" class="history-overlay" @click.self="showHistory = false">
        <v-card
            class="history-card"
            rounded="xl"
        >
          <v-card-title class="d-flex align-center justify-space-between">
            <h3 class="text-h6 font-weight-bold white--text">Recent Scans</h3>
            <v-btn icon variant="text" size="small" @click="showHistory = false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          <v-divider></v-divider>
          <v-list bg-color="transparent">
            <v-list-item
                v-for="(item, index) in recentScans"
                :key="index"
                @click="selectHistoryItem(item)"
                class="history-item"
            >
              <template v-slot:prepend>
                <v-avatar size="50" rounded="lg">
                  <v-img :src="item.image"></v-img>
                </v-avatar>
              </template>
              <v-list-item-title class="font-weight-bold white--text">
                {{ item.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ item.brand }} • {{ item.time }}
              </v-list-item-subtitle>
              <template v-slot:append>
                <v-chip
                    :color="getNutriScoreColor(item.nutriscore)"
                    size="small"
                >
                  {{ item.nutriscore }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </div>
    </transition>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useScanner } from '@/composables/useScanner'

const router = useRouter()
const videoElement = ref<HTMLVideoElement>()
const canvasElement = ref<HTMLCanvasElement>()
const flashOn = ref(false)
const showHistory = ref(false)
const scannedProduct = ref<any>(null)
const isScanning = ref(false)
const isFrozen = ref(false)
const isAnalyzing = ref(false)
const noProductFound = ref(false)
let stream: MediaStream | null = null
let scanInterval: number | null = null

// Use the scanner composable
const { scannedCode, scanFile } = useScanner()

// Mock recent scans data
const recentScans = ref([
  {
    barcode: '3760020507350',
    name: 'Greek Yogurt',
    brand: 'Chobani',
    image: 'https://images.openfoodfacts.org/images/products/500/013/400/3850/front_en.3.400.jpg',
    nutriscore: 'A',
    time: '2 min ago'
  },
  {
    barcode: '3760020507351',
    name: 'Almond Milk',
    brand: 'Alpro',
    image: 'https://images.openfoodfacts.org/images/products/376/168/005/5143/front_en.4.400.jpg',
    nutriscore: 'B',
    time: '15 min ago'
  },
  {
    barcode: '3760020507352',
    name: 'Oat Milk',
    brand: 'Oatly',
    image: 'https://images.openfoodfacts.org/images/products/737/628/065/5143/front_en.4.400.jpg',
    nutriscore: 'A',
    time: '1 hour ago'
  },
  {
    barcode: '3760020507353',
    name: 'Protein Bar',
    brand: 'Quest',
    image: 'https://images.openfoodfacts.org/images/products/406/855/002/2116/front_en.3.400.jpg',
    nutriscore: 'C',
    time: '3 hours ago'
  },
  {
    barcode: '3760020507354',
    name: 'Orange Juice',
    brand: 'Tropicana',
    image: 'https://images.openfoodfacts.org/images/products/301/762/042/2003/front_en.4.400.jpg',
    nutriscore: 'C',
    time: '1 day ago'
  }
])

onMounted(async () => {
  // Kamera starten
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // Rückkamera
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    })

    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }

    isScanning.value = true

    // Start automatic QR code scanning every 2 seconds
    startAutomaticScanning()
  } catch (err) {
    console.error('Kamera-Zugriff fehlgeschlagen:', err)
  }
})

onUnmounted(() => {
  // Kamera stoppen
  stopAutomaticScanning()
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
})

// Automatic QR code scanning from live video
const startAutomaticScanning = () => {
  scanInterval = window.setInterval(async () => {
    if (!videoElement.value || isFrozen.value || isAnalyzing.value) return

    try {
      // Capture current frame to canvas
      const canvas = document.createElement('canvas')
      const video = videoElement.value

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        if (!blob) return

        const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' })
        const result = await scanFile(file)

        if (result) {
          console.log('✅ Automatisch QR/Barcode gefunden:', result)
          // Don't show "no product found" for automatic scanning
          // The scannedCode watcher will handle it
        }
      }, 'image/jpeg')
    } catch (err) {
      // Silent fail for automatic scanning
    }
  }, 2000) // Scan every 2 seconds
}

const stopAutomaticScanning = () => {
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
}

// Watch for scanned codes
watch(scannedCode, (newCode) => {
  if (newCode) {
    console.log('✅ QR Code erfolgreich gescannt:', newCode)

    // Simulate product lookup
    scannedProduct.value = {
      barcode: newCode,
      name: 'Greek Yogurt Natural',
      brand: 'Chobani',
      image: 'https://images.openfoodfacts.org/images/products/500/013/400/3850/front_en.3.400.jpg',
      nutriscore: 'A'
    }

    // Auto-navigate after 2 seconds
    setTimeout(() => {
      router.push(`/product/${newCode}`)
    }, 2000)
  }
})

const toggleFlash = async () => {
  flashOn.value = !flashOn.value
  if (stream) {
    const track = stream.getVideoTracks()[0]
    const capabilities = track.getCapabilities() as any

    if (capabilities.torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: flashOn.value }]
        } as any)
      } catch (err) {
        console.error('Flash toggle failed:', err)
      }
    }
  }
}

const switchCamera = async () => {
  // Kamera wechseln
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }

  try {
    const currentFacing = stream?.getVideoTracks()[0].getSettings().facingMode
    const newFacing = currentFacing === 'environment' ? 'user' : 'environment'

    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacing }
    })

    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }
  } catch (err) {
    console.error('Kamera-Wechsel fehlgeschlagen:', err)
  }
}

const captureBarcode = async () => {
  if (!videoElement.value || !canvasElement.value) return

  // Freeze the screen
  isFrozen.value = true
  isAnalyzing.value = true
  noProductFound.value = false

  // Stop automatic scanning while frozen
  stopAutomaticScanning()

  // Capture frame to canvas
  const video = videoElement.value
  const canvas = canvasElement.value

  canvas.width = video.videoWidth
  canvas.height = video.videoHeight

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  // Analyze the frozen frame
  canvas.toBlob(async (blob) => {
    if (!blob) {
      isAnalyzing.value = false
      return
    }

    const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })
    const result = await scanFile(file)

    isAnalyzing.value = false

    if (result) {
      console.log('✅ Barcode im Foto gefunden:', result)
      // The scannedCode watcher will handle navigation
    } else {
      console.log('❌ No product found - Kein Barcode im Foto')
      noProductFound.value = true

      // Auto-hide no product found after 3 seconds
      setTimeout(() => {
        noProductFound.value = false
      }, 3000)
    }
  }, 'image/jpeg')
}

const unfreeze = () => {
  isFrozen.value = false
  scannedProduct.value = null
  noProductFound.value = false

  // Resume automatic scanning
  startAutomaticScanning()
}

const uploadPhoto = async () => {
  // Open file picker
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: any) => {
    const file = e.target?.files?.[0]
    if (file) {
      console.log('📷 Foto hochgeladen:', file.name)

      isAnalyzing.value = true
      noProductFound.value = false

      // Scan the uploaded image
      const result = await scanFile(file)

      isAnalyzing.value = false

      if (result) {
        console.log('✅ Barcode in hochgeladenem Bild gefunden:', result)
        // The watch on scannedCode will handle navigation
      } else {
        console.log('❌ No product found - Kein Barcode im hochgeladenen Bild')
        noProductFound.value = true

        // Auto-hide after 5 seconds
        setTimeout(() => {
          noProductFound.value = false
        }, 5000)
      }
    }
  }
  input.click()
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
}

const selectHistoryItem = (item: any) => {
  showHistory.value = false
  router.push(`/product/${item.barcode}`)
}

const openProduct = () => {
  if (scannedProduct.value) {
    router.push(`/product/${scannedProduct.value.barcode}`)
  }
}

const getNutriScoreColor = (score: string) => {
  const colors: Record<string, string> = {
    'A': 'success',
    'B': 'light-green',
    'C': 'warning',
    'D': 'orange',
    'E': 'error'
  }
  return colors[score] || 'grey'
}
</script>

<style scoped>
.scanner-container {
  height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
}

/* Gradient Header */
.scanner-header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(180deg,
  rgba(0,0,0,0.9) 0%,
  rgba(0,0,0,0.7) 40%,
  rgba(0,0,0,0.4) 70%,
  transparent 100%
  );
  padding: 16px 20px 40px 20px;
  pointer-events: none;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: auto;
}

/* Scanner View */
.scanner-view {
  height: 100vh;
  width: 100vw;
  position: relative;
  overflow: hidden;
}

/* Video Element - RICHTIGE VERSION (nicht gezoomt) */
.scanner-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

/* Scan Frame - with thick corners */
.scan-frame {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -95%);
  width: 280px;
  height: 280px;
  pointer-events: none;
  z-index: 5;
}

.frame-corner {
  position: absolute;
  width: 50px;
  height: 50px;
  border-color: #4CAF50;
  border-style: solid;
}

.frame-corner.top-left {
  top: -3px;
  left: -3px;
  border-width: 5px 0 0 5px;
  border-radius: 24px 0 0 0;
}

.frame-corner.top-right {
  top: -3px;
  right: -3px;
  border-width: 5px 5px 0 0;
  border-radius: 0 24px 0 0;
}

.frame-corner.bottom-left {
  bottom: -3px;
  left: -3px;
  border-width: 0 0 5px 5px;
  border-radius: 0 0 0 24px;
}

.frame-corner.bottom-right {
  bottom: -3px;
  right: -3px;
  border-width: 0 5px 5px 0;
  border-radius: 0 0 24px 0;
}

/* Animated Scanner Line */
.scanner-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg,
  transparent 0%,
  #4CAF50 50%,
  transparent 100%
  );
  box-shadow: 0 0 10px #4CAF50;
  opacity: 0;
}

.scanner-line.active {
  opacity: 1;
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%, 100% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  50% {
    top: calc(100% - 3px);
  }
}

/* Product Preview - Between scan frame and buttons */
.product-preview {
  position: absolute;
  bottom: 220px;
  left: 24px;
  right: 24px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.75) !important;
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(76, 175, 80, 0.3);
  z-index: 8;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.error-preview {
  border: 1px solid rgba(244, 67, 54, 0.3) !important;
  cursor: default !important;
}

/* Analyzing Overlay */
.analyzing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9;
}

.analyzing-card {
  backdrop-filter: blur(20px);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

/* Scanner Controls */
.scanner-controls {
  position: absolute;
  bottom: 100px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  padding: 20px;
  z-index: 10;
}

.capture-btn {
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.5) !important;
  transition: all 0.3s ease;
}

/* History Overlay - Centered with margin */
.history-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.history-card {
  width: 100%;
  max-width: 500px;
  max-height: 70vh;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.9) !important;
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(76, 175, 80, 0.3);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
}

.history-item {
  border-radius: 12px;
  margin: 4px 8px;
  transition: background-color 0.2s;
}

.history-item:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

/* Transitions */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: scale(0.95);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>