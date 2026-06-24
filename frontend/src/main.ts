import { createApp } from 'vue'
import App from './App.vue'
import { router } from './router/index.ts'
import { createPinia } from 'pinia'
import './assets/main.scss'

const pinia = createPinia()

createApp(App).use(router).use(pinia).mount('#app')
