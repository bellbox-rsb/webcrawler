<template>
  <div>
    <SiteDetails :metadata="data.metadata" />
    <TechStack :data="data.tech_stack" />
    <MediaGallery :data="data.media" />

    <div class="w-full mt-12 fade-in delay-300 pb-20">
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-white font-medium flex items-center gap-2">
          <FileText :size="18" />
          Content
        </h3>
        <div class="flex gap-2">
          <button @click="handleCopy" class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white transition-colors flex items-center gap-2">
            <Clipboard :size="14" /> Copy MD
          </button>

          <button @click="handleDownload" class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white transition-colors flex items-center gap-2">
            <Download :size="14" /> Save MD
          </button>
          <button @click="handleDownloadHTML" class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-white transition-colors flex items-center gap-2">
            <FileCode :size="14" /> Save HTML
          </button>
          <button @click="handleImportClick" class="px-3 py-1.5 rounded-lg border border-white/10 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 text-xs transition-colors flex items-center gap-2">
            <Upload :size="14" /> Import
          </button>
          <input
            type="file"
            ref="fileInputRef"
            @change="handleFileChange"
            class="hidden"
            accept=".md,.html,.txt"
          />
          <button @click="$emit('reset')" class="px-3 py-1.5 rounded-lg border border-white/10 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs transition-colors flex items-center gap-2">
            <RotateCcw :size="14" /> Reset
          </button>
        </div>
      </div>

      <div class="rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] p-6 shadow-2xl">
        <Editor :initial-content="editorContent" @update="handleEditorUpdate" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { FileText, Clipboard, Download, RotateCcw, Upload, FileCode } from 'lucide-vue-next'
import { marked } from 'marked'
import TechStack from './TechStack.vue'
import MediaGallery from './MediaGallery.vue'
import Editor from './Editor.vue'
import SiteDetails from './SiteDetails.vue'
import { convertToMarkdown } from '../utils/markdownConverter'

const props = defineProps({
  data: Object
})

const emit = defineEmits(['reset'])

const editorContent = ref('')
const markdownContent = ref('')
const htmlContent = ref('')
const fileInputRef = ref(null)

// Initialize content from data
watch(() => props.data, async (newData) => {
    if (newData?.html) {
        editorContent.value = newData.html
        htmlContent.value = newData.html
        try {
            const md = await convertToMarkdown(newData.html)
            markdownContent.value = md
        } catch (e) {
            console.error("Initial MD conversion failed", e)
        }
    }
}, { immediate: true })


const handleEditorUpdate = (html, markdown) => {
    htmlContent.value = html
    markdownContent.value = markdown
}

const handleCopy = () => {
    navigator.clipboard.writeText(markdownContent.value).then(() => {
        alert('Markdown copied to clipboard!')
    })
}

const getFilename = (ext) => {
    if (props.data?.metadata?.title) {
        const safeTitle = props.data.metadata.title.replace(/[^a-z0-9 \.\-]/gi, '_').trim()
        return `${safeTitle}.${ext}`
    }
    return `crawled_content.${ext}`
}

const handleDownload = () => {
    const blob = new Blob([markdownContent.value], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = getFilename('md');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const handleDownloadHTML = () => {
    const blob = new Blob([htmlContent.value], { type: 'text/html' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = getFilename('html');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

const handleImportClick = () => {
    fileInputRef.value?.click()
}

const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
        const content = e.target.result

        if (file.name.endsWith('.md')) {
            const html = await marked.parse(content)
            editorContent.value = html
        } else {
            editorContent.value = content
        }
    }
    reader.readAsText(file)
    event.target.value = ''
}
</script>
