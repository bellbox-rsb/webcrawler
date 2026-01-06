<template>
  <div class="min-h-screen flex flex-col relative overflow-x-hidden text-neutral-400 selection:bg-white/20 selection:text-white">
    <!-- Backgrounds -->
    <div class="fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none z-0"></div>
    <div class="noise-bg"></div>

    <Header />

    <router-view></router-view>
  </div>
</template>

<script setup>
import Header from './components/Header.vue'
</script>
