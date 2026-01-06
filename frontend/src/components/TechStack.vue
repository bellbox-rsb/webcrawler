<template>
  <div v-if="data && Object.keys(data).length > 0" class="w-full mt-8 fade-in delay-200">
    <button
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between p-4 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900/80 transition-all duration-200 group"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 group-hover:text-emerald-300 transition-colors">
          <Cpu :size="18" />
        </div>
        <div class="text-left">
          <h3 class="text-sm font-medium text-white">Detected Technology</h3>
          <p class="text-xs text-neutral-500">
            {{ totalTechs }} technologies found across {{ Object.keys(groupedData).length }} categories
          </p>
        </div>
      </div>
      <component :is="isOpen ? ChevronDown : ChevronRight" :size="18" />
    </button>

    <div v-if="isOpen" class="mt-2 p-4 bg-neutral-900/30 border border-white/5 rounded-xl border-t-0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="(techs, category) in groupedData" :key="category" class="p-4 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
          <div class="text-[10px] uppercase tracking-wider text-neutral-500 mb-3 font-semibold">
            {{ category }}
          </div>
          <div class="space-y-2">
            <div v-for="(tech, idx) in techs" :key="idx" class="flex items-center gap-2 group/item">
              <Box :size="14" class="text-neutral-600 group-hover/item:text-neutral-400 transition-colors" />
              <div class="flex flex-col">
                <span class="text-sm text-neutral-300 font-medium group-hover/item:text-white transition-colors">{{ tech.name }}</span>
                <span v-if="tech.version" class="text-[10px] text-neutral-600">{{ tech.version }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ChevronDown, ChevronRight, Cpu, Box } from 'lucide-vue-next';

const props = defineProps({
  data: Object
});

const isOpen = ref(false);

const groupedData = computed(() => {
  if (!props.data) return {};
  return categorizeData(props.data);
});

const totalTechs = computed(() => {
  return Object.values(groupedData.value).reduce((acc, curr) => acc + curr.length, 0);
});

// Custom Categorization Logic
const categorizeData = (rawData) => {
    const categories = {
        'Programming Languages': [],
        'Frontend Frameworks': [],
        'Backend Frameworks': [],
        'Hosting': [],
        'CDN': [],
        'Utils': []
    };

    const knownMappings = {
        // Languages
        'Python': 'Programming Languages',
        'JavaScript': 'Programming Languages',
        'TypeScript': 'Programming Languages',
        'PHP': 'Programming Languages',
        'Go': 'Programming Languages',
        'Ruby': 'Programming Languages',

        // Frontend
        'React': 'Frontend Frameworks',
        'Vue.js': 'Frontend Frameworks',
        'Next.js': 'Frontend Frameworks',
        'Nuxt.js': 'Frontend Frameworks',
        'Angular': 'Frontend Frameworks',
        'Svelte': 'Frontend Frameworks',
        'Tailwind CSS': 'Frontend Frameworks',
        'Bootstrap': 'Frontend Frameworks',
        'jQuery': 'Frontend Frameworks',

        // Backend
        'Flask': 'Backend Frameworks',
        'Django': 'Backend Frameworks',
        'Express': 'Backend Frameworks',
        'Laravel': 'Backend Frameworks',
        'Rails': 'Backend Frameworks',
        'FastAPI': 'Backend Frameworks',

        // Hosting/Servers
        'Nginx': 'Hosting',
        'Apache': 'Hosting',
        'Vercel': 'Hosting',
        'Netlify': 'Hosting',
        'Amazon Web Services': 'Hosting',
        'Docker': 'Hosting',
        'Ubuntu': 'Hosting',

        // CDN
        'Cloudflare': 'CDN',
        'Fastly': 'CDN',
        'Akamai': 'CDN',
        'Amazon CloudFront': 'CDN',
    };

    const categoryKeyMap = {
        'web-servers': 'Hosting',
        'operating-systems': 'Hosting',
        'paas': 'Hosting',
        'cms': 'Backend Frameworks',
        'programming-languages': 'Programming Languages',
        'javascript-frameworks': 'Frontend Frameworks',
        'web-frameworks': 'Backend Frameworks',
        'content-delivery-networks': 'CDN'
    };

    // Process all entries
    Object.entries(rawData).forEach(([catKey, techs]) => {
        if (!techs) return;

        techs.forEach(tech => {
            let targetCat = 'Utils'; // Default

            // 1. Check specific tech name mapping
            if (knownMappings[tech.name]) {
                targetCat = knownMappings[tech.name];
            }
            // 2. Check detected category mapping
            else if (categoryKeyMap[catKey]) {
                targetCat = categoryKeyMap[catKey];
            }
            // 3. Heuristics for "Detected" category (Wappalyzer raw output)
            else if (catKey === 'Detected') {
                // If it's in detected but not known, it falls to Utils
                targetCat = 'Utils';
            }

            // Avoid duplicates
            if (!categories[targetCat].some(t => t.name === tech.name)) {
                categories[targetCat].push(tech);
            }
        });
    });

    // Remove empty categories but keep preferred order if present
    const orderedResult = {};
    Object.keys(categories).forEach(key => {
        if (categories[key].length > 0) {
            orderedResult[key] = categories[key];
        }
    });

    return orderedResult;
};
</script>
