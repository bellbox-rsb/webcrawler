<template>
  <header class="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
    <div class="flex items-center gap-2 group cursor-pointer">
      <Pickaxe class="text-white group-hover:text-emerald-400 transition-colors" :size="20" />
      <span class="text-white font-medium tracking-tighter text-sm uppercase">CRAWLER</span>
    </div>

    <nav class="flex gap-4 md:gap-8 items-center">
      <a href="https://github.com/raksitbell/webcrawler" target="_blank" rel="noreferrer" class="text-xs font-medium text-neutral-500 hover:text-white transition-colors flex items-center gap-1">
        <Github :size="14" />
        <span class="hidden md:inline">GitHub</span>
      </a>
    </nav>
  </header>
</template>

<script setup>
import { Pickaxe, Github } from 'lucide-vue-next'
</script>
