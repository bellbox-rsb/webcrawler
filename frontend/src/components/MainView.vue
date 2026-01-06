<template>
  <main class="flex-grow flex flex-col items-center justify-center px-4 relative z-10 w-full max-w-4xl mx-auto mt-12 md:mt-0">
    <Hero />

    <SearchForm
      v-model:url="url"
      :loading="loading"
      @submit="crawl(url)"
    />

    <div v-if="error" class="mt-6 w-full max-w-2xl fade-in delay-100">
      <div class="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
        <AlertTriangle :size="16" />
        {{ error }}
      </div>
    </div>

    <ResultView v-if="data" :data="data" @reset="reset" />
    
    <div v-else-if="!loading" class="mt-8">
      <!-- Empty state or placeholder if needed -->
    </div>
  </main>
</template>

<script setup>
import { AlertTriangle } from 'lucide-vue-next'
import Hero from './Hero.vue'
import SearchForm from './SearchForm.vue'
import ResultView from './ResultView.vue'
import { useCrawler } from '../composables/useCrawler'

const { url, loading, data, error, crawl, reset } = useCrawler()
</script>
