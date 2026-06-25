<script setup lang="ts">
// import HomeView from './views/HomeView.vue'
// import About from './views/About.vue';
</script>

<template>
  <nav>
    <RouterLink to="/">Go to Home</RouterLink>
    <RouterLink to="/about">Go to About</RouterLink>
  </nav>
  <RouterView />
  <!-- <HomeView /> -->
</template>
