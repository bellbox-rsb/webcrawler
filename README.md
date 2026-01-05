# 🪏 WebCrawler (v3.0)

<div align="center" markdown="1">

![Version](https://img.shields.io/badge/version-3.0-emerald.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-19-blue)
![Python](https://img.shields.io/badge/python-3.11-yellow)
![Docker](https://img.shields.io/badge/docker-ready-blue)

<p align="center">
  <b>Turn the Web into Editable Content.</b><br>
  A premium, AI-ready web crawler that extracts clean HTML/Markdown. <br>
  Now featuring a modern React frontend and Tiptap editor.
</p>

</div>

---

## ✨ Core Features

### 🚀 **Deep Extraction Engine**
-   **Intelligent Parsing**: Extracts clean content, removing ads and clutter.
-   **Clean HTML & Markdown**: Preserves structure for high-fidelity editing.
-   **Tech Stacks**: Detects frontend frameworks (React, Next.js) and server tech.

### ✍️ **Modern Editing Experience**
-   **Tiptap Editor**: A Notion/Ghost-style headless editor.
-   **Rich Interactions**: Bubble menus for quick formatting, floating menus for blocks.
-   **Export Ready**: One-click Copy/Download as Markdown or HTML.

### 🏗️ **Modern Architecture**
-   **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons.
-   **Backend**: Python Flask API (Dockerized).
-   **Infrastructure**: Fully containerized with Docker Compose.
-   **Design**: "Nexus" Design System with Deep Mode and Safe Search UI.

---

## 🚀 Quick Start

### 🐳 Using Docker (Recommended)

1.  **Start the App**
    ```bash
    ./start.sh
    ```
    This will build and launch both Frontend (`http://localhost:5173`) and Backend (`http://localhost:5000`).
    
    > **Note:** If Docker is not installed, the script automatically falls back to **Manual Mode**, helping you install dependencies and run Flask/Vite directly.

### 🛠️ Manual Setup

**Backend**
```bash
cd backend
pip install -r requirements.txt
flask run
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## 📚 Documentation

-   [**Tech Stack Deep Dive**](frontend/public/docs/tech.md): Architecture and design patterns.
-   [**Changelog**](frontend/public/docs/changelog.md): Version history.
-   [**Backend Documentation**](backend/README.md): API and Setup details.
-   [**Frontend Documentation**](frontend/README.md): UI and Component details.

---

## 📄 License
MIT License.
