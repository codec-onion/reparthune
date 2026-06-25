import { createWebHashHistory, createRouter } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import About from '../views/About.vue'

const routes = [
  { path: '/', component: HomeView },
  { path: '/about', component: About},
]

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
})