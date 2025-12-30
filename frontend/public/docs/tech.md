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
