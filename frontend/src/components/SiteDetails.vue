<template>
  <div v-if="metadata" class="w-full max-w-4xl fade-in mb-8">
    <div class="p-6 rounded-xl bg-neutral-900/30 border border-white/5 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-6 items-start md:items-center">

      <!-- Icon Placeholder or Favicon -->
      <div class="h-16 w-16 min-w-[64px] rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white shadow-lg">
        <Globe :size="32" class="text-emerald-400" :stroke-width="1.5" />
      </div>

      <div class="flex-grow space-y-2">
        <h2 class="text-xl md:text-2xl font-semibold text-white tracking-tight leading-snug">
          {{ metadata.title }}
        </h2>

        <p v-if="metadata.description" class="text-neutral-400 text-sm leading-relaxed line-clamp-2">
          {{ metadata.description }}
        </p>

        <div class="flex items-center gap-4 pt-1">
          <a :href="metadata.url" target="_blank" rel="noopener noreferrer" class="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors group">
            <LinkIcon :size="12" class="group-hover:rotate-45 transition-transform" />
            {{ metadata.domain }}
          </a>
          <span class="flex items-center gap-1.5 text-xs text-neutral-500">
            <FileText :size="12" />
            Marked Content
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Globe, Link as LinkIcon, FileText } from 'lucide-vue-next'

defineProps({
  metadata: Object
})
</script>
