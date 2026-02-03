import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.jf.nutriscan',
  appName: 'JF-NutriScan',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    path: 'android',
    // Für NixOS - Android Studio ist im PATH
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
    },
  },
}

export default config