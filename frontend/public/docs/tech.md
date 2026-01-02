# 🛠️ Technical Architecture (v3.0)

## Overview

WebCrawler v3.0 is a decoupled full-stack application. It separates the crawling logic (Python/Flask) from the presentation layer (React/Vite), communicating via a RESTful JSON API.

## 📂 Project Structure

```text
/workspaces/webcrawler
├── backend/                 # Python Flask API
│   ├── app/
│   │   ├── services/       # Core crawler logic
│   │   ├── routes.py       # JSON API Endpoints
│   │   └── ...
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                # React (Vite) Application
│   ├── src/
│   │   ├── components/     # Tiptap Editor, SearchForm
│   │   └── App.jsx
│   ├── Dockerfile
│   └── vite.config.js
├── docs/                   # Documentation
├── docker-compose.yml      # Orchestration
└── start.sh                # Startup script
```

## 🏗️ Technology Stack

### Backend (API)
-   **Flask**: REST API framework.
-   **BeautifulSoup4**: HTML parsing and cleaning.
-   **Wappalyzer & BuiltWith**: Technology profiling.
-   **Docker**: Containerized runtime.

### Frontend (UI)
-   **React + Vite**: Fast, modern UI library.
-   **Tailwind CSS**: styling.
-   **Tiptap**: Headless rich-text editor for content manipulation.
-   **Lucide React**: Iconography.

## 🧱 Key Components

### 1. Crawler Service
Returns cleaned HTML instead of Markdown to allow the client-side editor (Tiptap) to handle the content state.

### 2. Editor (Tiptap)
A block-based editor setup that:
-   Accepts HTML input.
-   Provides "Bubble Menu" for inline formatting.
-   Provides "Floating Menu" for block creation.
-   Exports content to Markdown via `turndown`.

### 3. API Contract
`POST /crawl`
-   **Input**: `{ "url": "https://..." }`
-   **Output**: `{ "html": "...", "tech_stack": {...}, "success": true }`


## 🧩 Editor Architecture & API


## Overview
The **Nexus Editor** is a rich text editing experience built on top of [Tiptap](https://tiptap.dev/), a headless wrapper for ProseMirror. It provides a Notion-like interface with slash commands, floating menus, and bubble menus.

## Core Dependencies
- **@tiptap/react**: Core framework adapter.
- **@tiptap/starter-kit**: Basic marks and nodes (Bold, Italic, Heading, etc.).
- **@tiptap/extension-table**: Tables with resizable columns and row/col management.
- **@tiptap/extension-youtube**: Embeds YouTube videos.
- **turndown**: Converts HTML to Markdown for export.
- **turndown-plugin-gfm**: Adds GitHub Flavored Markdown support (Tables, Strikethrough) to Turndown.
- **marked**: Converts Markdown to HTML for import.

## Key Features

### 1. Import/Export Logic
The editor supports bi-directional content conversion:

#### Import (Markdown -> HTML)
Located in `App.jsx`, imports use `marked` to parse `.md` files into HTML strings, which are then passed to `editor.commands.setContent()`.

```javascript
// App.jsx
const html = await marked.parse(markdownContent)
setEditorContent(html)
```

#### Export (HTML -> Markdown)
Located in `Editor.jsx` (live updates) and `App.jsx` (initial load). We use `turndown` with custom rules to preserve complex elements.

**Custom Rules:**
- **Tables**: Handled by `turndown-plugin-gfm`.
- **YouTube Embeds**: A custom rule detects the Editor's `div[data-youtube-video]` wrapper and preserves the raw `<iframe>` HTML in the Markdown output.

```javascript
// Custom Rule logic
turndownService.addRule('youtube', {
    filter: (node) => node.nodeName === 'DIV' && node.hasAttribute('data-youtube-video'),
    replacement: (content, node) => node.querySelector('iframe').outerHTML
})
```

### 2. Media Handling
- **Images**: Added via URL. Handled by standard Tiptap Image extension.
- **Videos**: Added via YouTube URL. The `Youtube` extension wraps the iframe in a responsive container.

### 3. Toolbar System
- **Bubble Menu**: Appears on text selection. Provides formatting options (Bold, Italic, Link, Headings).
- **Floating Menu**: Appears on empty lines. Provides block insertions (Heading, List, Image, Video, Table).

## Future Development
To extend the editor:
1.  **Add Extension**: Install the Tiptap extension package.
2.  **Configure**: Add it to the `extensions` array in `Editor.jsx`.
3.  **UI**: Add a button to the `BubbleMenu` or `FloatingMenu` in `Editor.jsx`.
4.  **Export**: If the extension produces complex HTML, add a corresponding `Turndown` rule in both `Editor.jsx` and `App.jsx` to ensure it exports correctly to Markdown.
