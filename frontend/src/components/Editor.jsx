import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import FloatingMenuExtension from '@tiptap/extension-floating-menu'
import Youtube from '@tiptap/extension-youtube'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TurndownService from 'turndown'
import { gfm } from 'turndown-plugin-gfm'
import { useEffect } from 'react'
import { Bold, Italic, Strikethrough, Code, Heading1, Heading2, List, ListOrdered, Quote, Image as ImageIcon, Video, Table as TableIcon } from 'lucide-react'

const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
})
turndownService.use(gfm)

// Custom Rule: Preserve YouTube Iframes
turndownService.addRule('youtube', {
    filter: (node, options) => {
        return node.nodeName === 'DIV' && node.hasAttribute('data-youtube-video')
    },
    replacement: (content, node, options) => {
        const iframe = node.querySelector('iframe')
        return iframe ? iframe.outerHTML : ''
    }
})

const MenuButton = ({ onClick, isActive, children, title }) => (
    <button
        onClick={onClick}
        className={`p-1.5 rounded-md transition-colors ${isActive ? 'bg-neutral-700 text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
            }`}
        title={title}
        type="button"
    >
        {children}
    </button>
)

export function Editor({ initialContent, onUpdate }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
                autolink: true,
            }),
            BubbleMenuExtension,
            FloatingMenuExtension,
            Youtube.configure({
                controls: true,
                nocookie: true,
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: initialContent || '<p>Start crawling to see content here...</p>',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            try {
                const markdown = turndownService.turndown(html)
                // console.log("Markdown Export Update:", markdown.substring(0, 50) + "...") 
                onUpdate(html, markdown)
            } catch (e) {
                console.error("Markdown conversion failed:", e)
                onUpdate(html, "")
            }
        },
        editorProps: {
            attributes: {
                class: 'min-h-[400px] outline-none prose prose-invert max-w-none'
            }
        }
    })

    // Update content when initialContent changes (e.g. new crawl)
    useEffect(() => {
        if (editor && initialContent !== undefined) {
            // Prevent clearing if undefined passed initially
            if (initialContent === '') {
                editor.commands.clearContent()
            } else {
                editor.commands.setContent(initialContent)
            }
        }
    }, [initialContent, editor])

    if (!editor) {
        return null
    }

    return (
        <div className="w-full">
            {/* Bubble Menu: Appears on text selection */}
            {editor && <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl p-1 flex gap-1 items-center flex-wrap max-w-[400px]">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                    <Bold size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                    <Italic size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
                    <Strikethrough size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')}>
                    <Code size={16} />
                </MenuButton>
                <div className="w-px h-4 bg-neutral-700 mx-1"></div>
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
                    <Heading1 size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
                    <Heading2 size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                    <List size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                    <ListOrdered size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
                    <Quote size={16} />
                </MenuButton>
            </BubbleMenu>}

            {/* Floating Menu: Appears on new line */}
            {editor && <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl p-1 flex gap-1">
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })}>
                    <Heading1 size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })}>
                    <Heading2 size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                    <List size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                    <ListOrdered size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')}>
                    <Quote size={16} />
                </MenuButton>
                <div className="w-px bg-neutral-700 mx-1"></div>
                <MenuButton onClick={() => {
                    const url = window.prompt('Enter Image URL')
                    if (url) editor.chain().focus().setImage({ src: url }).run()
                }} title="Add Image">
                    <ImageIcon size={16} />
                </MenuButton>
                <MenuButton onClick={() => {
                    const url = window.prompt('Enter YouTube URL')
                    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run()
                }} title="Add Video">
                    <Video size={16} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Add Table">
                    <TableIcon size={16} />
                </MenuButton>
            </FloatingMenu>}

            <editor-content>
                <EditorContent editor={editor} />
            </editor-content>
        </div>
    )
}
