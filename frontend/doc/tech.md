# Technical Documentation

[← Back to README](../README.md)

## Project Structure

```
frontend/
├── doc/                 # Documentation
│   ├── api.md          # API Reference
│   └── tech.md         # Technical Architecture
├── public/              # Static assets and docs
├── src/
│   ├── components/     # Vue Components
│   ├── composables/    # Vue Composables (State Logic)
│   ├── App.vue         # Root Component
│   ├── main.js         # Entry Point
│   └── style.css       # Global Styles
├── index.html          # HTML Entry Point
└── package.json        # Dependencies
```

## Technology Stack

- **Framework**: Vue.js 3 (Composition API)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: Vue Router
- **Editor**: Tiptap (Headless wrapper)
- **Icons**: Lucide Vue Next
- **HTTP Client**: Axios

## Key Features

1.  **Crawler Interface**: Input URL, visualize results.
2.  **Rich Text Editor**: Tiptap integration for editing crawled content.
3.  **Markdown Viewer**: Renders documentation files from `public/docs`.
4.  **Deep Mode**: Dark mode design system.


