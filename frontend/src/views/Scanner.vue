<template>
  <v-container class="scanner-container pa-0" fluid>
    <!-- Camera Loading Screen (Green) -->
    <transition name="fade">
      <div v-if="!cameraReady" class="camera-loading">
        <div class="loading-content">
          <v-icon size="80" color="white" class="mb-4">mdi-camera</v-icon>
          <v-progress-circular
              indeterminate
              color="white"
              size="64"
              width="6"
              class="mb-4"
          ></v-progress-circular>
          <h3 class="text-h6 font-weight-bold mb-2" style="color: white">Initializing Camera...</h3>
          <p class="text-body-2 text-white opacity-70">Please allow camera access</p>
        </div>
      </div>
    </transition>

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
        <v-btn icon variant="text" @click="switchCamera" color="white">
          <v-icon>mdi-camera-flip</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Scanner Area -->
    <div class="scanner-view">
      <!-- Video Element für Kamera (Live View) -->
      <video
          v-show="!isFrozen && cameraReady"
          id="scanner-video"
          ref="videoElement"
          class="scanner-video"
          autoplay
          playsinline
          @loadedmetadata="onVideoReady"
          @canplay="onVideoCanPlay"
      ></video>

      <!-- Hidden QR Reader Element -->
      <div id="qr-reader" style="display: none;"></div>

      <!-- Canvas für Frozen Frame -->
      <canvas
          v-show="isFrozen"
          ref="canvasElement"
          class="scanner-video"
      ></canvas>

      <!-- Scan Frame with Thick Corners (nur wenn Kamera bereit) -->
      <transition name="fade">
        <div v-if="cameraReady" class="scan-frame">
          <div class="frame-corner top-left"></div>
          <div class="frame-corner top-right"></div>
          <div class="frame-corner bottom-left"></div>
          <div class="frame-corner bottom-right"></div>
          <!-- Animated Scanner Line -->
          <div class="scanner-line" :class="{ active: isScanning && !isFrozen }"></div>
        </div>
      </transition>

      <!-- Product Found Preview (below scan frame) -->
      <transition name="slide-up">
        <v-card
            v-if="scannedProduct && !isLoadingProduct"
            class="product-preview"
            rounded="xl"
            @click="openProduct"
        >
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar size="60" rounded="lg" class="mr-3" :color="scannedProduct.imageUrl ? undefined : 'grey-lighten-2'">
              <v-img
                  v-if="scannedProduct.imageUrl"
                  :src="scannedProduct.imageUrl"
                  :alt="scannedProduct.name"
              ></v-img>
              <v-icon v-else color="grey-darken-1" size="32">mdi-image-off-outline</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <div class="d-flex align-center mb-1">
                <h4 class="text-subtitle-1 font-weight-bold white--text">
                  {{ scannedProduct.name || 'Unbekanntes Produkt' }}
                </h4>
              </div>
              <p class="text-caption text-medium-emphasis mb-0">
                {{ scannedProduct.brand || 'Keine Marke' }}
              </p>
            </div>
            <v-icon color="white">mdi-chevron-right</v-icon>
          </v-card-text>
        </v-card>
      </transition>

      <!-- Loading Product Preview -->
      <transition name="slide-up">
        <v-card
            v-if="isLoadingProduct"
            class="product-preview"
            rounded="xl"
        >
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar size="60" rounded="lg" color="primary" class="mr-3">
              <v-progress-circular
                  indeterminate
                  color="white"
                  size="32"
                  width="3"
              ></v-progress-circular>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-bold white--text mb-1">
                Produkt wird geladen...
              </h4>
              <p class="text-caption text-medium-emphasis mb-0">
                Barcode: {{ currentBarcode }}
              </p>
            </div>
          </v-card-text>
        </v-card>
      </transition>

      <!-- No Product Found Message -->
      <transition name="slide-up">
        <v-card
            v-if="noProductFound && !scannedProduct && !isLoadingProduct"
            class="product-preview error-preview"
            rounded="xl"
        >
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar size="60" rounded="lg" color="error" class="mr-3">
              <v-icon color="white" size="32">mdi-alert-circle-outline</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-bold white--text mb-1">
                Produkt nicht gefunden
              </h4>
              <p class="text-caption text-medium-emphasis mb-0">
                Kein Produkt für diesen Barcode in der Datenbank gefunden.
              </p>
            </div>
            <v-btn icon size="small" variant="text" @click="clearMessages">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-text>
        </v-card>
      </transition>

      <!-- No Barcode Detected Message -->
      <transition name="slide-up">
        <v-card
            v-if="noBarcodeDetected && !scannedProduct && !isLoadingProduct && !noProductFound"
            class="product-preview error-preview"
            rounded="xl"
        >
          <v-card-text class="d-flex align-center pa-4">
            <v-avatar size="60" rounded="lg" color="warning" class="mr-3">
              <v-icon color="white" size="32">mdi-barcode-off</v-icon>
            </v-avatar>
            <div class="flex-grow-1">
              <h4 class="text-subtitle-1 font-weight-bold white--text mb-1">
                Kein Barcode erkannt
              </h4>
              <p class="text-caption text-medium-emphasis mb-0">
                Bitte richten Sie die Kamera auf einen Barcode oder QR-Code.
              </p>
            </div>
            <v-btn icon size="small" variant="text" @click="clearMessages">
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

    <!-- Bottom Controls (nur wenn Kamera bereit) -->
    <transition name="fade">
      <div v-if="cameraReady" class="scanner-controls">
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
    </transition>

    <!-- History Drawer - Centered with margin -->
    <transition name="slide-up">
      <div v-if="showHistory" class="history-overlay" @click.self="showHistory = false">
        <v-card class="history-card" rounded="xl">
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
                <v-chip :color="getNutriScoreColor(item.nutriscore)" size="small">
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
import { useProductsStore } from '@/stores/products'

const router = useRouter()
const productsStore = useProductsStore()
const videoElement = ref<HTMLVideoElement>()
const canvasElement = ref<HTMLCanvasElement>()
const flashOn = ref(false)
const showHistory = ref(false)
const scannedProduct = ref<any>(null)
const isScanning = ref(false)
const isFrozen = ref(false)
const isAnalyzing = ref(false)
const isLoadingProduct = ref(false)
const noProductFound = ref(false)
const noBarcodeDetected = ref(false)
const currentBarcode = ref('')
const cameraReady = ref(false)

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
  cameraReady.value = false

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    })

    if (videoElement.value) {
      videoElement.value.srcObject = stream
    }
  } catch (err) {
    console.error('Kamera-Zugriff fehlgeschlagen:', err)
    cameraReady.value = true
  }
})

onUnmounted(() => {
  stopAutomaticScanning()
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }
})

// Video Ready Callbacks
const onVideoReady = () => {
  console.log('📹 Video metadata loaded')
}

const onVideoCanPlay = () => {
  console.log('✅ Video can play - Kamera ist bereit!')

  setTimeout(() => {
    cameraReady.value = true
    isScanning.value = true
    startAutomaticScanning()
  }, 300)
}

// Automatic QR code scanning from live video
const startAutomaticScanning = () => {
  scanInterval = window.setInterval(async () => {
    if (!videoElement.value || isFrozen.value || isAnalyzing.value || !cameraReady.value || isLoadingProduct.value) return

    try {
      const canvas = document.createElement('canvas')
      const video = videoElement.value
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(async (blob) => {
        if (!blob) return
        const file = new File([blob], 'scan.jpg', { type: 'image/jpeg' })
        const result = await scanFile(file)
        if (result) {
          console.log('✅ Automatisch QR/Barcode gefunden:', result)
        }
      }, 'image/jpeg')
    } catch (err) {
      // Silent fail for automatic scanning
    }
  }, 2000)
}

const stopAutomaticScanning = () => {
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
}

// Watch for scanned codes and fetch product data
watch(scannedCode, async (newCode) => {
  if (newCode) {
    console.log('✅ QR Code erfolgreich gescannt:', newCode)
    currentBarcode.value = newCode

    // Clear previous states
    clearMessages()

    // Start loading
    isLoadingProduct.value = true

    try {
      // Fetch product from store
      const product = await productsStore.fetchProductByBarcode(newCode)

      if (product) {
        scannedProduct.value = product

        // Navigate to product detail after showing preview
        setTimeout(() => {
          router.push(`/product/${newCode}`)
        }, 2000)
      } else {
        // Product not found in database
        noProductFound.value = true
        setTimeout(() => {
          clearMessages()
        }, 4000)
      }
    } catch (error) {
      console.error('Fehler beim Laden des Produkts:', error)
      noProductFound.value = true
      setTimeout(() => {
        clearMessages()
      }, 4000)
    } finally {
      isLoadingProduct.value = false
    }
  }
})

const clearMessages = () => {
  scannedProduct.value = null
  noProductFound.value = false
  noBarcodeDetected.value = false
}

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
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
  }

  cameraReady.value = false

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
    cameraReady.value = true
  }
}

const captureBarcode = async () => {
  if (!videoElement.value || !canvasElement.value) return

  isFrozen.value = true
  isAnalyzing.value = true
  clearMessages()
  stopAutomaticScanning()

  const video = videoElement.value
  const canvas = canvasElement.value
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

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
    } else {
      console.log('❌ No barcode detected - Kein Barcode im Foto')
      noBarcodeDetected.value = true
      setTimeout(() => {
        clearMessages()
      }, 3000)
    }
  }, 'image/jpeg')
}

const unfreeze = () => {
  isFrozen.value = false
  clearMessages()
  startAutomaticScanning()
}

const uploadPhoto = async () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = async (e: any) => {
    const file = e.target?.files?.[0]
    if (file) {
      console.log('📷 Foto hochgeladen:', file.name)
      isAnalyzing.value = true
      clearMessages()

      const result = await scanFile(file)
      isAnalyzing.value = false

      if (result) {
        console.log('✅ Barcode in hochgeladenem Bild gefunden:', result)
      } else {
        console.log('❌ No barcode detected - Kein Barcode im hochgeladenen Bild')
        noBarcodeDetected.value = true
        setTimeout(() => {
          clearMessages()
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
    'a': 'success',
    'B': 'light-green',
    'b': 'light-green',
    'C': 'warning',
    'c': 'warning',
    'D': 'orange',
    'd': 'orange',
    'E': 'error',
    'e': 'error'
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

/* Camera Loading Screen (GREEN) */
.camera-loading {
  position: absolute;
  inset: 0;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  padding: 32px;
}

.opacity-70 {
  opacity: 0.7;
}

/* Gradient Header */
.scanner-header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.9) 0%,
      rgba(0, 0, 0, 0.7) 40%,
      rgba(0, 0, 0, 0.4) 70%,
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

/* Video Element */
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
  border-color: #4caf50;
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
  background: linear-gradient(90deg, transparent 0%, #4caf50 50%, transparent 100%);
  box-shadow: 0 0 10px #4caf50;
  opacity: 0;
}

.scanner-line.active {
  opacity: 1;
  animation: scan 2s ease-in-out infinite;
}

@keyframes scan {
  0%,
  100% {
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

/* Product Preview */
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

/* History Overlay */
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
  transition: opacity 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>