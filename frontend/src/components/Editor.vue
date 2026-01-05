<template>
  <div class="w-full">
    <bubble-menu
      v-if="editor"
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      class="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl p-1 flex gap-1 items-center flex-wrap max-w-[400px]"
    >
      <button
        v-for="(btn, index) in bubbleButtons"
        :key="index"
        @click="btn.action"
        :class="`p-1.5 rounded-md transition-colors ${btn.isActive() ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`"
        :title="btn.title"
      >
        <component :is="btn.icon" :size="16" />
      </button>
    </bubble-menu>

    <floating-menu
      v-if="editor"
      :editor="editor"
      :tippy-options="{ duration: 100 }"
      class="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl p-1 flex gap-1"
    >
        <button
            v-for="(btn, index) in floatingButtons"
            :key="index"
            @click="btn.action"
            :class="`p-1.5 rounded-md transition-colors ${btn.isActive() ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`"
            :title="btn.title"
        >
            <component :is="btn.icon" :size="16" />
        </button>

        <!-- Video Converter -->
        <template v-if="editor.isActive('link')">
            <div class="w-px h-4 bg-neutral-700 mx-1"></div>
            <button @click="convertToVideo" title="Convert to Video" class="p-1.5 rounded-md transition-colors text-neutral-400 hover:bg-neutral-800 hover:text-white">
                <Video :size="16" class="text-red-400" />
            </button>
        </template>
        
        <div class="w-px bg-neutral-700 mx-1"></div>
        
        <button @click="addImage" title="Add Image" class="p-1.5 rounded-md transition-colors text-neutral-400 hover:bg-neutral-800 hover:text-white">
            <ImageIcon :size="16" />
        </button>
        <button @click="addVideo" title="Add Video" class="p-1.5 rounded-md transition-colors text-neutral-400 hover:bg-neutral-800 hover:text-white">
             <Video :size="16" />
        </button>
        <button @click="addTable" title="Add Table" class="p-1.5 rounded-md transition-colors text-neutral-400 hover:bg-neutral-800 hover:text-white">
             <TableIcon :size="16" />
        </button>
    </floating-menu>

    <editor-content :editor="editor" />
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import LinkExtension from '@tiptap/extension-link'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import Youtube from '@tiptap/extension-youtube'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered, Quote, Image as ImageIcon, Video, Table as TableIcon } from 'lucide-vue-next'
import { convertToMarkdown } from '../utils/markdownConverter'

const props = defineProps({
  initialContent: String,
})

const emit = defineEmits(['update'])

const editor = useEditor({
  extensions: [
    StarterKit,
    Image.configure({ inline: true, allowBase64: true }),
    LinkExtension.configure({ openOnClick: false, autolink: true }),
    BubbleMenuExtension,
    FloatingMenuExtension,
    Youtube.configure({ controls: true, nocookie: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
  ],
  content: props.initialContent || '<p>Start crawling to see content here...</p>',
  editorProps: {
    attributes: {
      class: 'min-h-[400px] outline-none prose prose-invert max-w-none'
    }
  },
  onUpdate: async ({ editor }) => {
      const html = editor.getHTML()
      try {
          const markdown = await convertToMarkdown(html)
          emit('update', html, markdown)
      } catch (e) {
          console.error("Markdown conversion failed:", e)
          emit('update', html, "")
      }
  }
})

// Watch for external content changes
watch(() => props.initialContent, (newContent) => {
    if (editor.value && newContent !== undefined) {
        if (newContent === '') {
            editor.value.commands.clearContent()
        } else {
             // Avoid resetting cursor if content is same (basic check)
            if (editor.value.getHTML() !== newContent) {
                 editor.value.commands.setContent(newContent)
            }
        }
    }
})

onBeforeUnmount(() => {
    editor.value?.destroy()
})

// Helper actions
const convertToVideo = () => {
    const href = editor.value.getAttributes('link').href
    if (href) {
        editor.value.chain().focus().extendMarkRange('link').unsetLink().setYoutubeVideo({ src: href }).run()
    }
}

const addImage = () => {
    const url = window.prompt('Enter Image URL')
    if (url) editor.value.chain().focus().setImage({ src: url }).run()
}

const addVideo = () => {
    const url = window.prompt('Enter YouTube URL')
    if (url) editor.value.chain().focus().setYoutubeVideo({ src: url }).run()
}

const addTable = () => {
    editor.value.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}

// Button configs
const bubbleButtons = [
    { icon: Bold, action: () => editor.value.chain().focus().toggleBold().run(), isActive: () => editor.value.isActive('bold'), title: 'Bold' },
    { icon: Italic, action: () => editor.value.chain().focus().toggleItalic().run(), isActive: () => editor.value.isActive('italic'), title: 'Italic' },
    { icon: Strikethrough, action: () => editor.value.chain().focus().toggleStrike().run(), isActive: () => editor.value.isActive('strike'), title: 'Strike' },
    { icon: Code, action: () => editor.value.chain().focus().toggleCode().run(), isActive: () => editor.value.isActive('code'), title: 'Code' },
    { icon: Heading1, action: () => editor.value.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.value.isActive('heading', { level: 1 }), title: 'H1' },
    { icon: Heading2, action: () => editor.value.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.value.isActive('heading', { level: 2 }), title: 'H2' },
    { icon: List, action: () => editor.value.chain().focus().toggleBulletList().run(), isActive: () => editor.value.isActive('bulletList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => editor.value.chain().focus().toggleOrderedList().run(), isActive: () => editor.value.isActive('orderedList'), title: 'Ordered List' },
    { icon: Quote, action: () => editor.value.chain().focus().toggleBlockquote().run(), isActive: () => editor.value.isActive('blockquote'), title: 'Quote' },
]

const floatingButtons = [
    { icon: Heading1, action: () => editor.value.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.value.isActive('heading', { level: 1 }), title: 'H1' },
    { icon: Heading2, action: () => editor.value.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.value.isActive('heading', { level: 2 }), title: 'H2' },
    { icon: List, action: () => editor.value.chain().focus().toggleBulletList().run(), isActive: () => editor.value.isActive('bulletList'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => editor.value.chain().focus().toggleOrderedList().run(), isActive: () => editor.value.isActive('orderedList'), title: 'Ordered List' },
    { icon: Quote, action: () => editor.value.chain().focus().toggleBlockquote().run(), isActive: () => editor.value.isActive('blockquote'), title: 'Quote' },
]
</script>
