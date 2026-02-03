import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router/index.ts'
import vuetify from './plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')