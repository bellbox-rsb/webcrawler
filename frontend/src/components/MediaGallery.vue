<template>
  <div v-if="shouldRender" class="w-full mt-6 fade-in delay-200">
    <button
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between p-4 bg-neutral-900/50 border border-white/5 rounded-xl hover:bg-neutral-900/80 transition-all duration-200 group"
    >
      <div class="flex items-center gap-3">
        <div class="p-2 bg-purple-500/10 rounded-lg text-purple-400 group-hover:text-purple-300 transition-colors">
          <Image :size="18" />
        </div>
        <div class="text-left">
          <h3 class="text-sm font-medium text-white">Media Gallery</h3>
          <p class="text-xs text-neutral-500">
            {{ data.images?.length || 0 }} images, {{ data.videos?.length || 0 }} videos, {{ data.links?.length || 0 }} links
          </p>
        </div>
      </div>
      <component :is="isOpen ? ChevronDown : ChevronRight" :size="18" />
    </button>

    <div v-if="isOpen" class="mt-2 p-4 bg-neutral-900/30 border border-white/5 rounded-xl border-t-0">
      <!-- Tabs -->
      <div class="flex gap-2 mb-6 border-b border-white/5 pb-2 overflow-x-auto">
        <button
          @click="activeTab = 'all'"
          :class="`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'all' ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-500 hover:text-white'}`"
        >
          <Grid :size="14" /> All
        </button>
        <button v-if="hasImages"
          @click="activeTab = 'images'"
          :class="`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'images' ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-500 hover:text-white'}`"
        >
          <Image :size="14" /> Images ({{ data.images.length }})
        </button>
        <button v-if="hasVideos"
          @click="activeTab = 'videos'"
          :class="`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'videos' ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-500 hover:text-white'}`"
        >
          <Video :size="14" /> Videos ({{ data.videos.length }})
        </button>
        <button v-if="hasLinks"
          @click="activeTab = 'links'"
          :class="`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-2 ${activeTab === 'links' ? 'bg-purple-500/20 text-purple-300' : 'text-neutral-500 hover:text-white'}`"
        >
          <Link :size="14" /> Links ({{ data.links.length }})
        </button>
      </div>

      <!-- Content -->
      <div class="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-8">
        <div v-if="(activeTab === 'all' || activeTab === 'images') && hasImages">
          <h4 v-if="activeTab === 'all'" class="text-xs font-semibold text-neutral-500 uppercase mb-3 tracking-wider">Images</h4>
          
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div v-for="(img, i) in data.images" :key="i" class="group relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
              <img
                :src="img.src"
                :alt="img.alt"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  @click="copyToClipboard(img.src)"
                  class="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  title="Copy URL"
                >
                  <Copy :size="16" />
                </button>
                <button
                  @click="downloadImage(img.src, `image-${i}.jpg`)"
                  class="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  title="Download"
                >
                  <Download :size="16" />
                </button>
                <a
                  :href="img.src"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-sm transition-colors"
                  title="Open Original"
                >
                  <ExternalLink :size="16" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div v-if="(activeTab === 'all' || activeTab === 'videos') && hasVideos">
          <h4 v-if="activeTab === 'all'" class="text-xs font-semibold text-neutral-500 uppercase mb-3 tracking-wider">Videos</h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="(vid, i) in data.videos" :key="i" class="relative group rounded-lg overflow-hidden border border-white/10 bg-black">
                  <div class="aspect-video">
                      <iframe
                          :src="vid.src"
                          :title="vid.title"
                          class="w-full h-full"
                          frameBorder="0"
                          allowFullScreen
                      />
                  </div>
                  <div class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                          @click="copyToClipboard(vid.src)"
                          class="p-1.5 bg-black/50 rounded-lg hover:bg-black/70 text-white backdrop-blur-sm border border-white/10"
                          title="Copy Video URL"
                      >
                          <Copy :size="14" />
                      </button>
                  </div>
              </div>
          </div>
        </div>

        <div v-if="(activeTab === 'all' || activeTab === 'links') && hasLinks">
          <h4 v-if="activeTab === 'all'" class="text-xs font-semibold text-neutral-500 uppercase mb-3 tracking-wider">Links</h4>
          <div class="flex flex-col gap-3">
            <template v-for="(link, i) in data.links" :key="i">
                <div v-if="isYoutube(link.href)" class="relative group rounded-lg overflow-hidden border border-white/10 bg-black max-w-md">
                    <div class="aspect-video">
                        <iframe
                            :src="getYoutubeEmbed(link.href)"
                            :title="link.text"
                            class="w-full h-full"
                            frameBorder="0"
                            allowFullScreen
                        />
                    </div>
                    <div class="p-3 bg-neutral-900/90 flex justify-between items-center">
                        <span class="text-xs text-neutral-400 truncate pr-2">{{ link.text }}</span>
                        <div class="flex gap-2">
                            <button
                                @click="copyToClipboard(link.href)"
                                class="text-neutral-500 hover:text-white transition-colors"
                                title="Copy URL"
                            >
                                <Copy :size="14" />
                            </button>
                            <a
                                :href="link.href"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-neutral-500 hover:text-white transition-colors"
                            >
                                <ExternalLink :size="14" />
                            </a>
                        </div>
                    </div>
                </div>

                <div v-else class="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-colors group">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <Link :size="14" class="text-neutral-500 flex-shrink-0" />
                        <span class="text-sm text-neutral-300 truncate">{{ link.text }}</span>
                    </div>
                    <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            @click="copyToClipboard(link.href)"
                            class="p-1.5 text-neutral-400 hover:text-white transition-colors"
                            title="Copy URL"
                        >
                            <Copy :size="14" />
                        </button>
                        <a
                            :href="link.href"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="p-1.5 text-neutral-400 hover:text-purple-400 transition-colors"
                        >
                            <ExternalLink :size="14" />
                        </a>
                    </div>
                </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Image, Video, Link, ChevronDown, ChevronRight, ExternalLink, Copy, Download, Grid } from 'lucide-vue-next'

const props = defineProps({
  data: Object
})

const isOpen = ref(false)
const activeTab = ref('all')

const hasImages = computed(() => props.data?.images?.length > 0)
const hasVideos = computed(() => props.data?.videos?.length > 0)
const hasLinks = computed(() => props.data?.links?.length > 0)
const shouldRender = computed(() => hasImages.value || hasVideos.value || hasLinks.value)

const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
}

const downloadImage = (url, filename) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename || 'image'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

const isYoutube = (url) => {
    return url.includes('youtube.com') || url.includes('youtu.be')
}

const getYoutubeEmbed = (url) => {
    let videoId = '';
    if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1].split('?')[0];
    }
    if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
}
</script>
