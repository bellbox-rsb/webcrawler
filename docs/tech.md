# 🛠️ Technical Architecture (v2.0)

## Overview

WebCrawler v2.0 is a full-stack Flask application designed for high-fidelity content extraction. It adheres to a **Service-Oriented Architecture (SOA)**, separating core crawling logic from the web presentation layer.

## 📂 Project Structure

```text
/workspaces/crawler
├── app/
│   ├── services/
│   │   └── crawler.py       # Core extraction logic & heuristic detection
│   ├── static/
│   │   ├── style.css        # Tailwind CSS customizations (Nexus theme)
│   │   └── script.js        # Frontend logic (QuillJS, file saving)
│   ├── templates/
│   │   ├── index.html       # Main application interface
│   │   └── doc.html         # Documentation renderer
│   ├── __init__.py          # Flask app factory
│   ├── routes.py            # HTTP route definitions
│   └── utils.py             # Helper functions (Tech Icon mapping)
├── docs/                    # Documentation files
│   ├── changelog.md
│   └── tech.md
├── run.py                   # Application entry point
├── .gitignore               # Git ignore rules
├── vercel.json              # Vercel deployment config
└── requirements.txt         # Python dependencies
```

## 🏗️ Technology Stack

### Backend
-   **Flask**: Lightweight WSGI web framework.
-   **BeautifulSoup4**: HTML parsing and DOM manipulation.
-   **Markdownify**: HTML to Markdown conversion engine.
-   **BuiltWith & Wappalyzer**: Technology profiling.

### Frontend
-   **Tailwind CSS**: Utility-first CSS framework (Dark mode, Inter font).
-   **QuillJS**: Rich text editing with custom dark theme overrides.
-   **Turndown.js**: Client-side HTML-to-Markdown for editor export.

## 🧱 Key Components

### 1. Crawler Service (`app/services/crawler.py`)
This module contains the heavy lifting for the application.

```python
def crawl_url(url: str) -> Dict[str, Any]:
    """
    Crawls the given URL, extracts its main content as Markdown,
    and detects the technology stack used.
    """
    # 1. Detect Tech Stack (Server-side)
    tech_stack = _detect_tech_stack(url)
    
    # 2. Fetch & Parse
    response = requests.get(url, headers=headers)
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # 3. Analyze Client-Side (Heuristics)
    more_tech = _analyze_client_side(url, soup)
    
    # 4. Clean & Convert
    _remove_clutter(soup)
    markdown = _extract_markdown(soup)
    
    return { 'success': True, 'markdown': markdown, ... }
```

### 2. Heuristic Detection
We don't just rely on headers; we inspect the HTML for framework signatures.

-   **React**: Looks for `data-reactroot` or `_reactListening`.
-   **Next.js**: Checks for `id="__NEXT_DATA__"`.
-   **Tailwind**: Scans for class names like `text-gray-`.

### 3. Routes (`app/routes.py`)
Handles the web traffic and documentation serving.

-   **`GET /`**: Renders the main `index.html`.
-   **`POST /`**: Accepts a URL form submission, calls `crawl_url`, and renders results.
-   **`GET /docs/<path:filename>`**: Dynamically loads Markdown files from the `docs/` directory and renders them using the `doc.html` template.

