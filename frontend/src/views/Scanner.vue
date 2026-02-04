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

        <h3 class="text-h6 font-weight-bold white--text">NutriScan</h3>

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
      <!-- Video Element für Kamera (RICHTIGE VERSION - nicht gezoomt) -->
      <video
          id="scanner-video"
          ref="videoElement"
          class="scanner-video"
          autoplay
          playsinline
      ></video>

      <!-- Scan Frame with Thick Corners -->
      <div class="scan-frame">
        <div class="frame-corner top-left"></div>
        <div class="frame-corner top-right"></div>
        <div class="frame-corner bottom-left"></div>
        <div class="frame-corner bottom-right"></div>
        <!-- Animated Scanner Line -->
        <div class="scanner-line" :class="{ active: isScanning }"></div>
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
      >
        <v-icon>mdi-image-plus</v-icon>
      </v-btn>

      <!-- Capture Button (Main) -->
      <v-btn
          icon
          size="72"
          color="primary"
          elevation="12"
          class="capture-btn"
          @click="captureBarcode"
      >
        <v-icon size="40">mdi-camera</v-icon>
      </v-btn>

      <!-- History -->
      <v-btn
          icon
          size="large"
          variant="elevated"
          color="surface"
          elevation="4"
          @click="toggleHistory"
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const videoElement = ref<HTMLVideoElement>()
const flashOn = ref(false)
const showHistory = ref(false)
const scannedProduct = ref<any>(null)
const isScanning = ref(false)
let stream: MediaStream | null = null

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
  // Kamera starten (RICHTIGE VERSION)
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
  } catch (err) {
    console.error('Kamera-Zugriff fehlgeschlagen:', err)
  }
})

onUnmounted(() => {
  // Kamera stoppen
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
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

const captureBarcode = () => {
  // Simulate scanning
  setTimeout(() => {
    scannedProduct.value = {
      barcode: '3760020507350',
      name: 'Greek Yogurt Natural',
      brand: 'Chobani',
      image: 'https://images.openfoodfacts.org/images/products/500/013/400/3850/front_en.3.400.jpg',
      nutriscore: 'A'
    }
  }, 1000)
}

const uploadPhoto = () => {
  // Open file picker
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.onchange = (e: any) => {
    const file = e.target?.files?.[0]
    if (file) {
      console.log('Photo uploaded:', file)
      // Process uploaded photo for barcode scanning
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
  transform: translate(-50%, -50%);
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
  bottom: 200px;
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

.position-relative {
  position: relative;
  z-index: 1;
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
</style>