<template>
  <form @submit.prevent="handleSubmit" class="w-full max-w-2xl relative group fade-in delay-100 mb-12">
    <!-- Mode Switcher -->
    <div class="flex gap-4 mb-4 justify-center relative z-10">
      <button 
        type="button"
        @click="$emit('update:mode', 'crawl')"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
          mode === 'crawl' 
            ? 'bg-neutral-800 text-white shadow-lg border border-white/10' 
            : 'text-neutral-500 hover:text-neutral-300'
        ]"
      >
        <div class="flex items-center gap-2">
          <FileText :size="14" />
          Crawler
        </div>
      </button>
      <button 
        type="button"
        @click="$emit('update:mode', 'map')"
        :class="[
          'px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
          mode === 'map' 
            ? 'bg-neutral-800 text-white shadow-lg border border-white/10' 
            : 'text-neutral-500 hover:text-neutral-300'
        ]"
      >
        <div class="flex items-center gap-2">
          <Network :size="14" />
          Mapper
        </div>
      </button>
    </div>

    <!-- Glow effect -->
    <div class="absolute -inset-0.5 bg-gradient-to-r from-neutral-700 to-neutral-800 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>

    <div class="relative flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl shadow-black/50 transition-all duration-300 focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-800 overflow-hidden">
      <div class="pl-5 text-neutral-500">
        <Search :size="20" :stroke-width="1.5" />
      </div>

      <input
        type="text"
        placeholder="https://example.com"
        :value="url"
        @input="$emit('update:url', $event.target.value)"
        class="w-full bg-transparent border-none text-white placeholder-neutral-600 px-4 py-5 text-base focus:ring-0 focus:outline-none h-16 font-light"
        autoComplete="off"
        autoFocus
        required
      />

      <div class="pr-3 flex items-center gap-3">
        <button
          type="submit"
          :disabled="loading"
          class="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-lg transition-colors border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Loader2 v-if="loading" :size="18" class="animate-spin" />
          <ArrowRight v-else :size="18" :stroke-width="1.5" />
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ArrowRight, Loader2, Search, FileText, Network } from 'lucide-vue-next';

defineProps({
  url: String,
  loading: Boolean,
  mode: String
});

const emit = defineEmits(['update:url', 'submit', 'update:mode']);

const handleSubmit = () => {
  emit('submit');
};
</script>
