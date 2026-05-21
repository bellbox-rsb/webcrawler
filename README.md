# 🪏 AetherCrawler (v3.0)

<div align="center" markdown="1">

![Version](https://img.shields.io/badge/version-3.0-emerald.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)

<p align="center">
  <b>Turn the Web into Design Systems & Markdown.</b><br>
  A premium, high-fidelity web crawler that extracts design tokens, page layout parameters, parses clean clutter-free Markdown, and scans technologies.
</p>

</div>

---

## ✨ Core Features

### 🚀 **Deep Design Token Extraction**
-   **CSS Variable Harvester**: Automatically extracts colors, fonts, sizing, weights, and spacing properties.
-   **Role Classifier**: Categorizes colors into active design system roles (Primary, Brand, Accent, Neutral, Slate).
-   **Assets Masonry**: Compiles raw inline SVGs and image references into copyable, responsive assets galleries.

### 🧠 **Tech Stack & Platform Intelligence**
-   **Heuristic Signature Checks**: Local regex fingerprint scanner checks page DOM triggers for frameworks (React, Vue, Angular, Svelte), stylesheets (Tailwind, Bootstrap), and CMS (WordPress, PHP).
-   **Infrastructure Headers Scan**: Inspects powered-by, servers, and server proxy headers (Cloudflare, Nginx, Apache, Express) for zero-latency detection.
-   **Branded Badges Grid**: Visualizes detected platforms on a sleek glassmorphic overview using high-fidelity Shields.io indicators.

### 📄 **Clean HTML-to-Markdown Engine**
-   **Semantic Stripper**: Excludes layout noise (`script`, `style`, `nav`, `footer`, `header`, `noscript`, `iframe`) to retrieve pure article and section content.
-   **Relative Path Resolver**: Rewrites relative paths in image sources and links to absolute, fully-qualified web resources.
-   **Dual-Panel Previews**: Displays single-page crawler metadata vs. extracted Markdown in a tabbed dialog with a copy-to-clipboard button.

### ☁️ **Vercel Serverless Ready**
-   **Zero-Dependency Execution**: Free from heavyweight python scrapers or databases that trigger serverless cold starts and timeouts.
-   **Vite + Express Bundle**: Standardized Vite frontend compiler + Express server API wrapper fully deployable on Vercel.

---

## 📂 Project Structure

```
├── api/
│   └── index.js            # Vercel serverless entry point
├── public/                 # Production-built assets & index.html
├── src/
│   ├── App.jsx             # Beautiful glassmorphic React dashboard
│   ├── components/
│   │   └── ui/             # Core interactive layout components (Dialog, Tabs, Slider, etc.)
│   ├── lib/
│   │   ├── utils.js        # Design-token Tailwind merging helper
│   │   └── techBadges.js   # Shields.io badge mapping helper
│   └── index.css           # Core styling declarations
├── crawler.js              # Cheerio-based scraping & Turndown Markdown services
├── server-app.js           # Express backend router & local file export endpoint
├── server.js               # Dev / Production server starter
├── vite.config.js          # Vite assets bundler & backend server proxy configuration
├── vercel.json             # Vercel deployment settings mapping
└── package.json            # Node.js dependencies configuration
```

---

## 🚀 Quick Start

### Local Development

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/raksitbell/webcrawler.git
    cd webcrawler
    ```

2.  **Install Node Dependencies**
    ```bash
    npm install
    ```

3.  **Run Development Environment**
    ```bash
    # Starts the local backend server (port 3000) and the Vite frontend dev server (port 5173)
    npm run dev & npm run server
    ```
    Access the interactive dashboard at `http://localhost:5173`.

4.  **Production Compilation**
    ```bash
    npm run build
    npm run start
    ```

---

## 📄 License
MIT License.
