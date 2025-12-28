# 🪏 WebCrawler (v2.0)

<div align="center" markdown="1">

![Version](https://img.shields.io/badge/version-2.0-emerald.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9%2B-blueviolet)

<p align="center">
  <b>Turn the Web into Data.</b><br>
  A premium, AI-ready web crawler that extracts clean Markdown and detects technology stacks.
</p>

</div>

---

## ✨ Core Features

### 🚀 **Deep Extraction Engine**
-   **Pure Markdown**: Converts chaotic HTML into clean, semantic Markdown suitable for LLM training or notes.
-   **Smart Cleaning**: Automatically removes ads, popups, navigation bars, and footers.
-   **Relative Link Resolution**: Ensures all images and links work by converting relative paths to absolute URLs.

### 🧠 **Tech Stack Intelligence**
-   **Heuristic Detection**: Identifies frontend frameworks (React, Vue, Next.js, Tailwind) even when obfuscated.
-   **Server-Side Analysis**: Detects underlying server technologies matches via `builtwith`.
-   **Visual Grid**: Results are displayed in a modern, "Nexus" style grid card layout.

### 🎨 **Premium "Nexus" UI**
-   **Tailwind CSS**: Custom-built dark theme with noise textures and glassmorphism.
-   **Responsive Design**: Fully optimized for Mobile, Tablet, and Desktop.
-   **Interactive Editor**: Integrated **QuillJS** editor to refine your content before export.

### 🛠️ **Developer Extensions**
-   **Vercel Ready**: Configured for instant serverless deployment.
-   **API Structure**: Modular `crawler.py` service easy to integrate into other apps.
-   **Live Docs**: Documentation served directly within the app at `/docs`.

---

## 🚀 Quick Start

### Local Development

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/raksitbell/webcrawler.git
    cd webcrawler
    ```

2.  **Install Dependencies**
    ```bash
    pip install -r requirements.txt
    ```

3.  **Run the App**
    ```bash
    python run.py
    ```
    Access the app at `http://127.0.0.1:5001`.

### ☁️ Deploy to Vercel

This project is configured for Vercel.

1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the project directory.

---

## 📚 Documentation

Detailed documentation is available in the `docs` folder or via the **Documentation** link in the app.

-   [**Tech Stack Deep Dive**](docs/tech.md): Architecture, libraries, and design patterns.
-   [**Changelog**](docs/changelog.md): History of version updates.

---

## 📄 License
MIT License.
